var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
				res.sendfile('index.html');
				});


var roomQueue = new Array();
var numUser = 0;
var mineArea = {};
var roomCnt = 0;

//const
remainBomb='remainBomb';
remainArea='remainArea';
player = 'player';
io.sockets.on('connection', function(socket){
				var name , roomname;
				var mineAreaX ,mineAreaY,bombCount ;
				var targetSocket,targetName;
				var who,another;
				var isPlaying=false;
				debug_f=true;
				numUser++;
				//socket.broadcast.emit('numUser',{numUser:numUser});
				console.log('useNUM:'+numUser);

				socket.on('disconnect', function() {
						numUser--;

						if(who==1){

						if(mineArea[roomname][player][another]!= undefined){
						mineArea[roomname][player][another].emit('mesg',{msg:'enemy escaped!!!You WIN!!!'});
						emitPlayer(roomname,'gameOver',tmp);
						mineArea[roomname][player][another].disconnect();
						}
						delete mineArea[roomname];
						}
						else{//who==2
						if(mineArea[roomname]!= undefined)
						if(mineArea[roomname][player][another]!= undefined)
						mineArea[roomname][player][another].emit('mesg',{msg:'enemy escaped!!!You WIN!!!'});
						mineArea[roomname][player][another].disconnect();
						}
						console.log(name+' left');
						console.log('useNUM:'+numUser);
						io.sockets.emit('numUser',{numUser:numUser});
				});

				socket.on('create room', function(data){//room setting
								//socket.broadcast.emit('numUser',{numUser:numUser});
								io.sockets.emit('numUser',{numUser:numUser});

								if(isPlaying==true){
								mineArea[roomname][player][another].emit('mesg',{msg:'enemy escaped!!!You WIN!!!'});
								emitPlayer(roomname,'gameOver',tmp);
								mineArea[roomname][player][another].disconnect();
								}
								var i,j,cnt;
								name = data.name;
								roomname = name+'MaybeUseSHAFuture'+roomCnt++;
								mineAreaX = 9;
								mineAreaY = 9;
								bombCount = 10;
								console.log('user: ' + data.name);


								while(true){
								tmp = roomQueue.shift();
								if(tmp==undefined)break;
								if(mineArea[tmp.roomname]!=undefined)break;
								}
								if(tmp!=undefined){//TODO emit no room now;
										if(tmp.socket==socket)return;//the same player;
										if(mineArea[tmp.roomname]==undefined){console.log('join something wrong');return;}
										targetSocket = tmp.socket;
										targetName = tmp.name;
										roomname = tmp.roomname;
										socket.join(roomname);
										isPlyaing=true;
										who=2;
										another=1;
										mineArea[roomname][player][who]=socket;


										emitPlayer(roomname,'readyPlay',{p1:targetName,p2:name,numUser:numUser});

										/*start*/
										tmp={mineX:mineAreaX,mineY:mineAreaY,size:data.canvasSize};
										emitPlayer(roomname,'gameStart',tmp);

										/*update score and bomb*/
										tmp={remainArea:mineArea[roomname][remainArea],who:0,score1:mineArea[roomname]['score'][1],score2:mineArea[roomname]['score'][2]};
										emitPlayer(roomname,'sweep',tmp);
										console.log('after join.emit');
										return;
								}




								/*test*/
								roomQueue.push({socket:socket,name:name,roomname:roomname});
								socket.join(roomname);

								/**/
								//init mineArea for this socket;
								mineArea[roomname]=[];
								for(j=0;j<mineAreaY;j++){
										mineArea[roomname][j]=[];
										for(i=0;i<mineAreaX;i++){
												mineArea[roomname][j][i] = 0;
										}
								}
								if((mineAreaY*mineAreaX)<bombCount){
										console.log('wrong bombCount');
										return;
								}
								//put bomb
								cnt=bombCount;
								while(cnt>0){
										i = Math.floor((Math.random() * mineAreaX) );
										j = Math.floor((Math.random() * mineAreaY) );
										if(mineArea[roomname][j][i] == 0){
												mineArea[roomname][j][i] = 9;//	9 means is bomb!!!
												cnt--;
										}
								}
								console.log(cnt+',,'+bombCount);
								//debug: show in console
								/*console.log(' init end');
								  for(j=0;j<mineAreaY;j++){
								  tmp = '';		
								  for(i=0;i<mineAreaX;i++){
								  tmp += mineArea[roomname][j][i]+',';
								  }
								  console.log(tmp);
								  }*/

								//compute how many bomb nearby
								for(j=0;j<mineAreaY;j++){
										for(i=0;i<mineAreaX;i++){
												if(mineArea[roomname][j][i] == 9){continue;}	//is bomb;
												if(i>0){
														if(mineArea[roomname][j][i-1] == 9) mineArea[roomname][j][i]++;	//check left;
														if(j>0){//check l-up;
																if(mineArea[roomname][j-1][i-1] == 9) mineArea[roomname][j][i]++;
														}
														if(j<(mineAreaY-1)){//check l-down;
																if(mineArea[roomname][j+1][i-1] == 9) mineArea[roomname][j][i]++;
														}
												}
												if(i<(mineAreaX-1)){
														if(mineArea[roomname][j][i+1] == 9) mineArea[roomname][j][i]++;	//check right;
														if(j>0){//check r-up
																if(mineArea[roomname][j-1][i+1] == 9) mineArea[roomname][j][i]++;
														}
														if(j<(mineAreaY-1)){//check r-down
																if(mineArea[roomname][j+1][i+1] == 9) mineArea[roomname][j][i]++;
														}
												}
												if(j>0){
														if(mineArea[roomname][j-1][i] == 9) mineArea[roomname][j][i]++;	//check up;
												}
												if(j<(mineAreaY-1)){
														if(mineArea[roomname][j+1][i] == 9) mineArea[roomname][j][i]++;	//check down;
												}
										}
								}
								//debug: show in console
								console.log('compued end');
								/*for(j=0;j<mineAreaY;j++){
								  tmp = '';		
								  for(i=0;i<mineAreaX;i++){
								  tmp += mineArea[roomname][j][i]+',';
								  }
								  console.log(tmp);
								  }*/
								who=1;
								another=2;
								isPlaying=true;
								mineArea[roomname][remainBomb]=bombCount;
								mineArea[roomname][remainArea]=mineAreaX*mineAreaY-bombCount;
								mineArea[roomname][player]=[];
								mineArea[roomname][player][1]=socket;

								mineArea[roomname]['score']=[];
								mineArea[roomname]['score'][1]=0;
								mineArea[roomname]['score'][2]=0;
								console.log('after create room');

				});

				socket.on('sweep', function(data){//sweep whether bomb
								if(mineArea[roomname][data.areaY][data.areaX]<0){//should be prevent in client side, but is TODO
								}
								else if(mineArea[roomname][data.areaY][data.areaX]==9){
								mineArea[roomname][remainBomb]--;
								mineArea[roomname]['score'][who]-=10;
								tmp={remainArea:mineArea[roomname][remainArea],areaX:data.areaX,areaY:data.areaY,who:who,num:9,score1:(mineArea[roomname]['score'][1]),score2:mineArea[roomname]['score'][2]};
								emitPlayer(roomname,'sweep',tmp);
								mineArea[roomname][data.areaY][data.areaX]=(who*-1);
								}
								else if(mineArea[roomname][data.areaY][data.areaX]==0){
								mineArea[roomname]['score'][who]++;
								recursiveSweep(data.areaX,data.areaY);
								}
								else{
								mineArea[roomname][remainArea]--;
								mineArea[roomname]['score'][who]++;
								tmp={remainArea:mineArea[roomname][remainArea],areaX:data.areaX,areaY:data.areaY,who:who,num:mineArea[roomname][data.areaY][data.areaX],score1:mineArea[roomname]['score'][1],score2:mineArea[roomname]['score'][2]};
								emitPlayer(roomname,'sweep',tmp);

								mineArea[roomname][data.areaY][data.areaX]=who*(-1);
								}
								if(mineArea[roomname][remainArea]==0 || mineArea[roomname][remainBomb]==0){		

										if(mineArea[roomname]['score'][1]>mineArea[roomname]['score'][2]){
												mineArea[roomname][player][1].emit('mesg',{msg:'You WIN!!!'});
												mineArea[roomname][player][2].emit('mesg',{msg:'You lose...'});
										}
										else if((mineArea[roomname]['score'][1]<mineArea[roomname]['score'][2])){
												mineArea[roomname][player][1].emit('mesg',{msg:'You lose...'});
												mineArea[roomname][player][2].emit('mesg',{msg:'You WIN!!!'});
										}
										else{//draw
												mineArea[roomname][player][1].emit('mesg',{msg:'DRAW'});
												mineArea[roomname][player][2].emit('mesg',{msg:'DRAW'});
										}
										tmp={};
										emitPlayer(roomname,'gameOver',tmp);
										mineArea[roomname][player][another].disconnect();
										socket.disconnect();

								}
				});	
				function recursiveSweep(i,j){
						mineArea[roomname][remainArea]--;
						if(mineArea[roomname][j][i] != 0){//TODO sweep and return
								tmp={remainArea:mineArea[roomname][remainArea],areaX:i,areaY:j,who:who,num:mineArea[roomname][j][i],score1:(mineArea[roomname]['score'][1]),score2:mineArea[roomname]['score'][2]};
								emitPlayer(roomname,'sweep',tmp);
								mineArea[roomname][j][i]=who*(-1);
								return;
						}	//is bomb;
						tmp={remainArea:mineArea[roomname][remainArea],areaX:i,areaY:j,who:who,num:0,score1:(mineArea[roomname]['score'][1]),score2:mineArea[roomname]['score'][2]};
						emitPlayer(roomname,'sweep',tmp);
						mineArea[roomname][j][i]=who*(-1);
						if(i>0){
								if(mineArea[roomname][j][i-1] >= 0) recursiveSweep(i-1,j);	//check left;
								if(j>0){//check l-up;
										if(mineArea[roomname][j-1][i-1] >= 0) recursiveSweep(i-1,j-1);
								}
								if(j<(mineAreaY-1)){//check l-down;
										if(mineArea[roomname][j+1][i-1] >= 0) recursiveSweep(i-1,j+1);
								}
						}
						if(i<(mineAreaX-1)){
								if(mineArea[roomname][j][i+1] >= 0) recursiveSweep(i+1,j);	//check right;
								if(j>0){//check r-up
										if(mineArea[roomname][j-1][i+1] >= 0) recursiveSweep(i+1,j-1);
								}
								if(j<(mineAreaY-1)){//check r-down
										if(mineArea[roomname][j+1][i+1] >= 0) recursiveSweep(i+1,j+1);
								}
						}
						if(j>0){
								if(mineArea[roomname][j-1][i] >= 0) recursiveSweep(i,j-1);	//check up;
						}
						if(j<(mineAreaY-1)){
								if(mineArea[roomname][j+1][i] >= 0) recursiveSweep(i,j+1);	//check down;
						}
				}
				function emitPlayer(room,event,obj){
						io.sockets.in(room).emit(event,obj);
				}

});


http.listen(3000, function(){
				console.log('listening on *:3000');
				});



