function player(x, y){
    this.x = x;
    this.y = y;

    this.oldX = x;
    this.oldY = y;
    
    this.velX = 0;
    this.velY = 0;
    this.velStrafe = 0;
    this.velocity = 0;
    
    this.width = 1;
    this.height = 3;
    this.accel = 40;
    this.moveSpeed = 40;

    this.shotType = "MACHINEGUN";
    this.lifeState = "ALIVE";
    this.dyingTimer = 2;
        
    
    this.maxLife = 100;
    this.currentLife = 100;
    this.lifeRegen = 2;

    this.maxEnergy = 100;
    this.currentEnergy = 100;
    this.energyRegen = 1;

    this.shotSpeed = 20;

    this.shipWeapons = [];
    this.shipSpecialWeapons = [];
    this.shipSpecialMovements = [];

    this.botWeapons = [];
    this.botSpecialWeapons = [];
    this.botSpecialMovements = [];

    //cooldowns
    this.swapCooldown = 1;
    this.swapCooldownCurrent = 0;

    this.cameraCooldown = .25;
    this.cameraCooldownCurrent = 0;

    this.shotCooldown = .2;
    this.shotCooldownCurrent = 0;

    this.orientation = 90;
    this.heading = this.orientation;

    this.dyingTimer = 2;
    this.currentDyingTimer = 0;

    this.isAlive = true;
    this.state = "ship"; //ship, bot
    this.getElevation = function(){
        if(this.state == "ship"){
            if(this.highFlying){
                return 2;
            }
            return 1;
        }
        if(this.state == "bot"){
            return 0;
        }
    }

    this.onHit = function(damage){
        this.currentLife -= damage;
        
    }

    this.right = function(){return this.x + this.width/2;};
    this.left = function(){return this.x - this.width/2};
    this.top = function(){return this.y + this.height/2};
    this.bottom = function(){return this.y - this.height/2};
    
    this.printSides = function(){        
        console.log("Player Right: " + this.right() + " Left: " + this.left() + " Top" + this.top() + " Bottom" + this.bottom());
    }
    
    this.draw = function(){
        if(this.isAlive){
            draw.drawPlayerRect(game.gameWidth/2, game.gameHeight/2, this.width, this.height, this.orientation);   
        }
        else{
            //draw.drawPlayerRect(game.gameWidth/2, game.gameHeight/2, this.width, this.height, -this.orientation)
        }
    }        
            
    this.update = function(dt){

        if(this.lifeState == "ALIVE"){
            if(this.currentLife <= 0){
                this.isAlive = false;
                this.lifeState = "DYING";
            }
            else{
                //Update Cooldowns
                this.swapCooldownCurrent -= dt;
                this.cameraCooldownCurrent -= dt;
                this.shotCooldownCurrent -= dt;

                if(game.keys[game.KeyBinds.Common.SWITCH]){
                    if(this.swapCooldownCurrent <= 0)
                    {
                        if(this.state =="bot"){
                            this.state = "ship";
                            this.shotType = "MACHINEGUN";
                        }
                        else if(this.state == "ship"){
                            this.state = "bot";
                            this.shotType = "SHOTGUN";
                        }
                        this.swapCooldownCurrent = this.swapCooldown;
                    }
                }

                if(game.keys[game.KeyBinds.Common.CAMERA]){
                    if(this.cameraCooldownCurrent <= 0)
                    {
                        if(game.drawType =="camera"){
                            //draw = new drawPlayerCentricObject();
                            game.drawType = "player";
                        }
                        else if(game.drawType == "player"){
                            draw = new drawCameraCentricObject(this.x, this.y);
                            game.drawType = "camera";
                        }
                        this.cameraCooldownCurrent = this.cameraCooldown;
                    }
                }

                if(game.drawType == "player")
                {
                    draw.cameraX = this.x;
                    draw.cameraY = this.y;
                }


                        
                if(this.state == "ship")
                {
                    if(game.keys[game.KeyBinds.Ship.SHOOT]){
                        if(this.shotCooldownCurrent <= 0)
                        //console.log("shoot");
                            this.shoot(this.shotType);
                    }

                    if(game.keys[game.KeyBinds.Bot.SECONDARY]){
                        if(this.shotCooldownCurrent <= 0)
                        //console.log("shoot");
                            this.shoot("BOMB");
                    }

                    this.velStrafe/= 1.3;
                    //A
                    if(game.keys[game.KeyBinds.Ship.TURNLEFT]){
                        this.orientation+=4;
                    }
                    //D
                    if(game.keys[game.KeyBinds.Ship.TURNRIGHT]){
                        this.orientation-=4;
                    }
                                
                    if(game.keys[game.KeyBinds.Ship.ACCEL]){                
                        if(!game.keys[game.KeyBinds.Ship.DECEL]){
                            this.velocity += this.accel*2*dt;
                            //game.streamers.push(new bitStreamer(this.x, this.y, this.orientation, this.velocity/2, .4, .1)) 
                        }
                        if (this.velocity > this.moveSpeed*2)
                            this.velocity = this.moveSpeed*2;
                    }
                    
                    if(game.keys[game.KeyBinds.Ship.DECEL]){
                        this.velocity += -this.accel*dt;
                        if (this.velocity < -this.moveSpeed*2)
                            this.velocity = -this.moveSpeed*2;
                    }

                    if(this.velocity < 10)
                        this.velocity += this.accel*dt;

                    if(!game.keys[game.KeyBinds.Ship.SPECIAL])
                        this.heading = this.orientation;
                }
                if(this.state == "bot")
                {
                    if(game.keys[game.KeyBinds.Bot.SHOOT]){
                        if(this.shotCooldownCurrent <= 0)
                        //console.log("shoot");
                            this.shoot(this.shotType);
                    }

                    if(game.keys[game.KeyBinds.Bot.SECONDARY]){
                        if(this.shotCooldownCurrent <= 0)
                        //console.log("shoot");
                            this.shoot("WHIP");
                    }

                    if(game.keys[game.KeyBinds.Bot.SPECIAL])
                        if(this.shotCooldownCurrent <= 0)
                            this.shoot("BLOCK");

                     //A
                    if(game.keys[game.KeyBinds.Bot.STRAFELEFT]){
                        this.velStrafe += -this.accel*50*dt;            
                        this.velocity /= 2;
                        if(this.velStrafe < -this.moveSpeed)
                            this.velStrafe = -this.moveSpeed;
                    }
                    //D
                    else if(game.keys[game.KeyBinds.Bot.STRAFERIGHT]){
                        this.velStrafe += this.accel*50*dt;
                        this.velocity/=2;
                        if(this.velStrafe > this.moveSpeed)
                            this.velStrafe = this.moveSpeed;
                    }
                    else 
                        this.velStrafe /= 2;

                    //A
                    if(game.keys[game.KeyBinds.Bot.TURNLEFT]){
                        this.orientation+=5;            
                    }
                    //D
                    else if(game.keys[game.KeyBinds.Bot.TURNRIGHT]){
                        this.orientation-=5;;
                    }
                                
                    if(game.keys[game.KeyBinds.Bot.ACCEL]){
                        this.velocity += this.accel*20*dt;
                        if (this.velocity > this.moveSpeed)
                            this.velocity = this.moveSpeed;
                    }
                    
                    else if(game.keys[game.KeyBinds.Bot.DECEL]){
                        this.velocity += -this.accel*20*dt;
                        if (this.velocity < -this.moveSpeed)
                            this.velocity = -this.moveSpeed;
                    }
                    else
                        this.velocity/=1.1;

                    if(this.orientation < 0)
                        this.orientation += 360;
                    else if(this.orientation > 360)
                        this.orientation -= 360;
                    this.heading = this.orientation;
                }
            
            


            
            this.updateState(dt);
            
             oldX = this.x;
             oldY = this.y;
            
            //this.x += this.velX;
            //this.y += this.velY; 

            this.x += this.velocity * Math.cos(toRad(this.heading))*dt + this.velStrafe * Math.cos(toRad(this.heading - 90))*dt;
            this.y += this.velocity * Math.sin(toRad(this.heading))*dt + this.velStrafe * Math.sin(toRad(this.heading - 90))*dt;  

            //Wall Hit Detection
            for(var p = 0; p < game.currentSector.pillars.length; p++){
                var pillar = game.currentSector.pillars[p];

                if(pointInRectangle(this, pillar)){
                    if(this.state == "ship"){
                        if(pillar.elevation == 1){
                            this.currentLife -= this.maxLife;
                            this.isAlive = false;
                        }


                    }
                    else if(this.state == "bot"){
                        if(pillar.elevation == -1){
                            this.currentLife -= this.maxLife;
                            this.isAlive = false;
                        }

                        if(oldX < pillar.left() && this.x > pillar.left() 
                            || oldX > pillar.right() && this.x < pillar.right())
                            this.x = oldX;
                        if(oldY < pillar.bottom() && this.y > pillar.bottom()
                            || oldY > pillar.top() && this.y < pillar.top())
                            this.y = oldY;
                    }
                }
            }

            //console.log(this.getSector(oldX, oldY));
            if(this.getSectorY() != game.currentSector.y || this.getSectorX() != game.currentSector.x)
            {
                game.loadSector(this.getSectorX(), this.getSectorY());
                //game.currentSector = game.sectors[Math.floor((this.x+200)/400)][Math.floor((this.y+200)/400)];
            }
        }
    }
    else if(this.lifeState == "DYING"){
            this.shoot("DEATH");    
            this.currentDyingTimer+=dt;
            if(this.currentDyingTimer >= this.dyingTimer){
                this.lifeState = "DEAD";
                this.currentDyingTimer = 0; 
            }

    }
    else if(this.lifeState == "DEAD"){
        this.currentLife = this.maxLife;
        this.currentEnergy = this.maxEnergy;
        this.x = 0;
        this.y = 0;
        this.velocity = 0;
        this.state = "ship";
        this.lifeState = "ALIVE";
        this.isAlive = true;
    }

        
    }

    this.futureX = function(dt){

        return this.x +(this.x - this.oldX)*dt;
    }
    this.futureY = function(dt){
        return this.y +(this.y - this.oldY)*dt;
    }

    this.getSectorX = function(){
        return Math.floor((this.x+game.sectorWidth/2)/game.sectorWidth);
    }

    this.getSectorY = function(){
        return Math.floor((this.y+game.sectorHeight/2)/game.sectorHeight);
    }
    
    this.updateState = function(dt){
        
    }

    this.shoot = function(shotType){    

        if(shotType == "SHOTGUN"){
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation, 40, .8, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation-7, 40, .8, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+7, 40, .8, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation-14, 40, .8, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+14, 40, .8, 0, true, true, "#00AAAA"));
            this.shotCooldownCurrent = this.shotCooldown*2;
        }
        else if(shotType == "MACHINEGUN"){
            game.currentSector.bulletManager.addBullet(new bullet(this.x + 1 * Math.cos(toRad(this.heading - 90)), this.y + 1 * Math.sin(toRad(this.heading - 90)), this.orientation, 100, 1, 1, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x - 1 * Math.cos(toRad(this.heading - 90)), this.y - 1 * Math.sin(toRad(this.heading - 90)), this.orientation, 100, 1, 1, true, true, "#00AAAA"));

            this.shotCooldownCurrent  = this.shotCooldown/2;
        }
        else if(shotType == "WHIP"){
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation, 200, .2, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation, 200, .2, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation, 200, .2, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation, 200, .2, 0, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation, 200, .2, 0, true, true, "#00AAAA"));
            
            this.shotCooldownCurrent  = this.shotCooldown/3;
        }
        else if(shotType == "BOMB"){
            game.currentSector.bulletManager.addBullet(new bomb(this.x, this.y, this.orientation, this.velocity/2, 1, "EXPLODE", true, true, "#00AAAA"));
            this.shotCooldownCurrent  = this.shotCooldown*2;
        }
        else if(shotType == "BLOCK"){
            game.currentSector.pillars.push(new pillar(this.x + 1 * Math.cos(toRad(this.heading - 90)), this.y + 1 * Math.sin(toRad(this.heading - 90)), 10, 10, 1));
            
            this.shotCooldownCurrent  = this.shotCooldown*2;
        }
        else if(shotType == "DEATH"){
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*2, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*3, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*4, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*5, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*6, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*7, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*8, 10, .7, 2, true, true, "#00AAAA"));
            game.currentSector.bulletManager.addBullet(new bullet(this.x, this.y, this.orientation+45*9, 10, .7, 2, true, true, "#00AAAA"));
        }



        
    }
}