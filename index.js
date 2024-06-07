/** @type {HTMLCanvasElement} */

const g=9.8*0.05;
const f=0.01;//与空气阻力有关的参数
const interval=0.15;//渲染间隔
const v_init=20
const v_scale=0.3*v_init;
var fireworks=[];
var fireworks_particles=[];
var fireworks_type;

$(function(){main()})


function main() {

    my_canvas=document.getElementById("main_canvas");
    my_ctx=my_canvas.getContext('2d');
    my_canvas.width = window.innerWidth;
    my_canvas.height = window.innerHeight;
    buffer_canvas=document.getElementById("main_canvas");
    buffer_ctx=buffer_canvas.getContext('2d');
    buffer_canvas.width=my_canvas.width;
    buffer_canvas.height=my_canvas.height;

    
    my_canvas.addEventListener('click', (event) => {
        const x = event.offsetX;
        //const y = event.offsetY;
        var fp_v=(-(Math.random()-0.5)*2*v_scale-v_init)*2;
        
        fireworks_particles.push(new Particle(x,0.8*my_canvas.height,0,fp_v,`hsl(${Math.random()*360},100%,50%)`,2.5,1));
        //fireworks.push(new Firework(x,y,25,2));
      });

    animate();
}

class Particle{
    constructor(x,y,vx,vy,color,r,opacity,opacity_decay=1){
        this.x=x;
        this.y=y;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
        this.r=r;
        this.opacity=opacity;
        this.opacity_decay=opacity_decay;
    }

    update(){
        this.x+=interval*this.vx;
        this.y+=interval*this.vy;
        this.vx-=f*this.vx;
        this.vy+=interval*g-f*this.vy;
        this.opacity>0 ? (this.opacity-=0.01*this.opacity_decay) : this.opacity=0;
        //this.opacity-=0.01;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.fillStyle=this.color;
        ctx.globalAlpha=this.opacity;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.closePath()
    }

}

class Firework{
    constructor(x,y,particle_num,particle_r,pre_color){
        this.x=x;
        this.y=y;
        this.particles=[];
        for (let i = 0; i < particle_num; i++) {
            var color=pre_color||`hsl(${Math.random()*360},100%,50%)`;
            var theta=2*Math.PI*(Math.random()-0.5)*2;
            var v_fluctuation=(Math.random()-0.5)*2*v_scale;
            var vx=Math.cos(theta)*(v_init+v_fluctuation);
            var vy=Math.sin(theta)*(v_init+v_fluctuation);
            this.particles.push(new Particle(x,y,vx,vy,color,particle_r,1));
        }
    }

    update(){
        this.particles.forEach(particle=>particle.update());
    }

    draw(ctx){
        this.particles.forEach(particle=>particle.draw(ctx));
    }
}

class Firework_double_layers{
    constructor(x,y,particle_num,particle_r,pre_color){
        this.x=x;
        this.y=y;
        this.particles=[];
        for (let i = 0; i < particle_num*2; i++) {
            var color=pre_color||`hsl(${Math.random()*360},100%,50%)`;
            var theta=2*Math.PI*(Math.random()-0.5)*2;
            var v_fluctuation=(Math.random()-0.5)*2*v_scale;
            var vx=Math.cos(theta)*(v_init+v_fluctuation)*(i%3!=0?1:0.6);
            var vy=Math.sin(theta)*(v_init+v_fluctuation)*(i%3!=0?1:0.6);
            this.particles.push(new Particle(x,y,vx,vy,color,particle_r,1));
        }
    }

    update(){
        this.particles.forEach(particle=>particle.update());
    }

    draw(ctx){
        this.particles.forEach(particle=>particle.draw(ctx));
    }
}



class Firework_spark{
    constructor(x,y,particle_num,particle_r,v_random_scale=1){
        this.x=x;
        this.y=y;
        this.particles=[];
        this.little_fireworks=[];
        this.particle_r=particle_r;
        for (let i = 0; i < particle_num; i++) {
            var color=`#F6F586`;
            var theta=2*Math.PI*(Math.random()-0.5)*2;
            var v_fluctuation=(Math.random()-0.5)*2*v_scale*v_random_scale;
            var vx=Math.cos(theta)*(v_init+v_fluctuation);
            var vy=Math.sin(theta)*(v_init+v_fluctuation);
            this.particles.push(new Particle(x,y,vx,vy,color,particle_r,1));
            //this.little_fireworks.push(new Firework(x,y,5,particle_r*0.3,color));
        }
    }

    update(){
        if (this.particles[0].opacity>=0.4&&this.particles[0].opacity_decay===1) {
            this.particles.forEach(particle=>particle.update());
        }
        else if (this.particles[0].opacity<0.4&&this.particles[0].opacity_decay===1) {
            this.particles.forEach((particle,index)=>{
                particle.opacity_decay=15;
                particle.opacity=1;
                particle.update();
                this.little_fireworks.push(new Firework(particle.x,particle.y,5,this.particle_r*0.5,`#F6F586`));
                this.little_fireworks[index].update();
            });
        }
        else{
            this.particles.forEach(particle=>particle.update());
            this.little_fireworks.forEach(little_firework=>little_firework.update());
        
        }
        
    }

    draw(ctx){
        this.particles.forEach(particle=>particle.draw(ctx));
        if (this.particles[0].opacity_decay>1) {
            this.little_fireworks.forEach(little_firework=>little_firework.draw(ctx));
        }
    }
}


function animate() {
    my_ctx.fillStyle='rgb(0,0,0)';
    my_ctx.globalAlpha=0.2
    //my_ctx.beginPath()
    my_ctx.rect(0,0,my_canvas.width,my_canvas.height);
    my_ctx.fill();
    //my_ctx.clearRect(0, 0, my_canvas.width, my_canvas.height)

    fireworks_particles.forEach((fireworks_particle,index) => {
        if (fireworks_particle.vy>=0) {
            fireworks_type=Math.floor(Math.random()*1000)%3;
            //console.log(fireworks_type);
            switch (fireworks_type) {
                case 0:
                    fireworks.push(new Firework_spark(fireworks_particle.x,fireworks_particle.y,50,2,2));
                    break;
                case 1:
                    fireworks.push(new Firework_double_layers(fireworks_particle.x,fireworks_particle.y,50,2));
                    fireworks.push(new Firework_spark(fireworks_particle.x,fireworks_particle.y,50,2,2));
                    break;
                case 2:
                    fireworks.push(new Firework_double_layers(fireworks_particle.x,fireworks_particle.y,50,2));
                    break;
                default:
                    break;
            }
            //fireworks.push(new Firework_spark(fireworks_particle.x,fireworks_particle.y,50,2,2));
            delete fireworks_particle;
            fireworks_particles.splice(index,1);
        } else {
            fireworks_particle.update();
            fireworks_particle.draw(my_ctx);
        }
    })

    fireworks.forEach((firework, index) => {
      if (firework.particles[0].opacity <= 0) {
        delete firework;
        fireworks.splice(index, 1);
      } else {
        firework.update();
        firework.draw(my_ctx);
      }
    });
    
    
  
    requestAnimationFrame(animate);
}


