const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countEl = document.getElementById('count');
const uncertaintyEl = document.getElementById('uncertainty');
const energyEl = document.getElementById('energy');
const entangledEl = document.getElementById('entangled');
const decayingEl = document.getElementById('decaying');
const velocityEl = document.getElementById('velocity');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class QuantumParticle {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.positions = [];
        this.probabilities = [];
        this.collapsed = false;
        this.energy = Math.random() * 5 + 1;
        this.phase = Math.random() * Math.PI * 2;
        this.waveLength = Math.random() * 100 + 50;
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
        this.trail = [];
        this.maxTrailLength = 20;
        this.velocity = { x: 0, y: 0 };
        this.mass = 1;
        this.entangled = null;
        this.entanglementStrength = 0;
        this.lifespan = Math.random() * 10000 + 5000;
        this.age = 0;
        this.decaying = false;
        this.spin = Math.random() > 0.5 ? 1 : -1;
        this.spinSpeed = Math.random() * 0.1 + 0.05;
        this.tunneling = false;
        this.tunnelCooldown = 0;
        this.glowIntensity = Math.random() * 0.5 + 0.5;
        this.size = Math.random() * 3 + 2;
        this.temperature = Math.random() * 100 + 50;
        this.magnetic = Math.random() > 0.7;
        this.charge = Math.random() > 0.5 ? 1 : -1;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = Math.random() * 150 + 50;
            this.positions.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius
            });
            this.probabilities.push(Math.random());
        }
    }
    
    update(time) {
        this.age += 16;
        if (this.age > this.lifespan) {
            this.decaying = true;
            this.energy *= 0.98;
        }
        
        if (!this.collapsed) {
            this.phase += 0.02;
            this.positions.forEach((pos, i) => {
                const wave = Math.sin(time * 0.001 + this.phase + i * 0.5) * 20;
                pos.x = this.baseX + Math.cos((i / 8) * Math.PI * 2) * (this.waveLength + wave);
                pos.y = this.baseY + Math.sin((i / 8) * Math.PI * 2) * (this.waveLength + wave);
            });
            
            if (this.entangled && !this.entangled.collapsed) {
                this.entangled.positions.forEach((pos, i) => {
                    pos.x = this.entangled.baseX - (this.positions[i].x - this.baseX);
                    pos.y = this.entangled.baseY - (this.positions[i].y - this.baseY);
                });
            }
        } else {
            this.tunnelCooldown--;
            
            if (this.tunnelCooldown <= 0 && Math.random() < 0.001) {
                this.tunneling = true;
                this.baseX = Math.random() * canvas.width;
                this.baseY = Math.random() * canvas.height;
                this.tunnelCooldown = 300;
            }
            
            this.baseX += this.velocity.x;
            this.baseY += this.velocity.y;
            this.velocity.x *= 0.99;
            this.velocity.y *= 0.99;
            
            this.trail.push({x: this.baseX, y: this.baseY});
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }
    }
    
    draw(ctx, time) {
        const decayAlpha = this.decaying ? Math.max(0.1, this.energy / 5) : 1;
        
        if (this.collapsed) {
            if (this.tunneling) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.baseX, this.baseY, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                this.tunneling = false;
            }
            this.trail.forEach((point, i) => {
                ctx.save();
                ctx.globalAlpha = (i / this.trail.length) * 0.5;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            
            ctx.save();
            ctx.globalAlpha = decayAlpha;
            ctx.fillStyle = this.charge > 0 ? '#ff6666' : '#6666ff';
            ctx.shadowBlur = 20 * this.glowIntensity;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.baseX, this.baseY, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = this.spin > 0 ? '#ff0000' : '#0000ff';
            ctx.lineWidth = this.magnetic ? 3 : 2;
            ctx.beginPath();
            ctx.arc(this.baseX, this.baseY, 8, 0, Math.PI * 2 * this.spin * time * 0.001);
            ctx.stroke();
            ctx.restore();
        } else {
            this.positions.forEach((pos, i) => {
                const mouseDist = Math.sqrt((pos.x - mouseX) ** 2 + (pos.y - mouseY) ** 2);
                const mouseEffect = Math.max(0, 1 - mouseDist / 100);
                
                ctx.save();
                const tempEffect = this.temperature / 100;
                const alpha = (Math.sin(time * 0.003 + i * 0.3) + 1) * 0.3 * this.probabilities[i] * decayAlpha;
                ctx.globalAlpha = alpha + mouseEffect * 0.3;
                ctx.fillStyle = `hsl(${(this.temperature - 50) * 2 + 180}, 100%, 50%)`;
                ctx.shadowBlur = 15 + mouseEffect * 10 + tempEffect * 5;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3 + mouseEffect * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                if (i > 0) {
                    ctx.save();
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(this.positions[i-1].x, this.positions[i-1].y);
                    ctx.lineTo(pos.x, pos.y);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        }
    }
    
    collapse(clickX, clickY) {
        if (this.collapsed) return false;
        
        let minDist = Infinity;
        let closestPos = null;
        
        this.positions.forEach(pos => {
            const dist = Math.sqrt((pos.x - clickX) ** 2 + (pos.y - clickY) ** 2);
            if (dist < minDist && dist < 100) {
                minDist = dist;
                closestPos = pos;
            }
        });
        
        if (closestPos) {
            this.baseX = closestPos.x;
            this.baseY = closestPos.y;
            this.collapsed = true;
            
            if (this.entangled && !this.entangled.collapsed) {
                this.entangled.collapsed = true;
                this.entangled.baseX = this.entangled.positions[0].x;
                this.entangled.baseY = this.entangled.positions[0].y;
            }
            
            return true;
        }
        return false;
    }
}

function drawInterference() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            
            if (!p1.collapsed && !p2.collapsed) {
                const dx = p2.baseX - p1.baseX;
                const dy = p2.baseY - p1.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 300) {
                    ctx.save();
                    ctx.globalAlpha = 0.1 * (1 - distance / 300);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(p1.baseX, p1.baseY);
                    ctx.lineTo(p2.baseX, p2.baseY);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }
}

function checkCollisions() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            
            if (p1.collapsed && p2.collapsed && p1.magnetic && p2.magnetic) {
                const dx = p2.baseX - p1.baseX;
                const dy = p2.baseY - p1.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const angle = Math.atan2(dy, dx);
                    const force = 0.2;
                    p1.velocity.x += Math.cos(angle) * force;
                    p1.velocity.y += Math.sin(angle) * force;
                    p2.velocity.x -= Math.cos(angle) * force;
                    p2.velocity.y -= Math.sin(angle) * force;
                }
            } else if (p1.collapsed && p2.collapsed) {
                const dx = p2.baseX - p1.baseX;
                const dy = p2.baseY - p1.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20) {
                    const angle = Math.atan2(dy, dx);
                    const force = p1.charge === p2.charge ? 0.5 : -0.3;
                    p1.velocity.x -= Math.cos(angle) * force;
                    p1.velocity.y -= Math.sin(angle) * force;
                    p2.velocity.x += Math.cos(angle) * force;
                    p2.velocity.y += Math.sin(angle) * force;
                }
            }
        }
    }
}

let mouseX = 0;
let mouseY = 0;
const MAX_PARTICLES = 50;

const particles = [];

function drawGrid() {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    ctx.restore();
}

function animate(currentTime) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    checkCollisions();
    drawInterference();
    
    particles.forEach(particle => {
        particle.update(currentTime);
        particle.draw(ctx, currentTime);
    });
    
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].energy < 0.1) {
            particles.splice(i, 1);
            countEl.textContent = particles.length;
        }
    }
    
    const uncollapsed = particles.filter(p => !p.collapsed).length;
    const uncertainty = uncollapsed > 0 ? (uncollapsed * 47.3).toFixed(1) : '0';
    uncertaintyEl.textContent = `Uncertainty: ${uncertainty}ℏ`;
    
    const totalEnergy = particles.reduce((sum, p) => sum + p.energy, 0);
    energyEl.textContent = totalEnergy.toFixed(1);
    
    const entangledCount = particles.filter(p => p.entangled).length;
    entangledEl.textContent = `Entangled: ${entangledCount}`;
    
    const decayingCount = particles.filter(p => p.decaying).length;
    decayingEl.textContent = `Decaying: ${decayingCount}`;
    
    const avgVel = particles.reduce((sum, p) => sum + Math.sqrt(p.velocity.x**2 + p.velocity.y**2), 0) / particles.length || 0;
    velocityEl.textContent = `Avg Velocity: ${avgVel.toFixed(2)}`;
    
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let collapsed = false;
    particles.forEach(particle => {
        if (particle.collapse(x, y)) {
            collapsed = true;
        }
    });
    
    if (!collapsed) {
        if (particles.length < MAX_PARTICLES) {
            const newParticle = new QuantumParticle(x, y);
            
            if (particles.length > 0 && Math.random() < 0.3) {
                const partner = particles[Math.floor(Math.random() * particles.length)];
                if (!partner.entangled && !partner.collapsed) {
                    newParticle.entangled = partner;
                    partner.entangled = newParticle;
                    newParticle.color = partner.color;
                }
            }
            
            particles.push(newParticle);
            countEl.textContent = particles.length;
        }
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'c':
            particles.forEach(p => { if (!p.collapsed) p.collapsed = true; });
            break;
        case 'r':
            particles.length = 0;
            countEl.textContent = '0';
            break;
        case 's':
            particles.forEach(p => p.collapsed = false);
            break;
    }
});

for (let i = 0; i < 3; i++) {
    particles.push(new QuantumParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
    ));
}
countEl.textContent = particles.length;

animate(0);