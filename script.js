const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countEl = document.getElementById('count');
const uncertaintyEl = document.getElementById('uncertainty');
const energyEl = document.getElementById('energy');

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
        if (this.collapsed) {
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
            ctx.globalAlpha = 1;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.baseX, this.baseY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            this.positions.forEach((pos, i) => {
                ctx.save();
                const alpha = (Math.sin(time * 0.003 + i * 0.3) + 1) * 0.3 * this.probabilities[i];
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
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

function checkCollisions() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            
            if (p1.collapsed && p2.collapsed) {
                const dx = p2.baseX - p1.baseX;
                const dy = p2.baseY - p1.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20) {
                    const angle = Math.atan2(dy, dx);
                    const force = 0.5;
                    p1.velocity.x -= Math.cos(angle) * force;
                    p1.velocity.y -= Math.sin(angle) * force;
                    p2.velocity.x += Math.cos(angle) * force;
                    p2.velocity.y += Math.sin(angle) * force;
                }
            }
        }
    }
}

const particles = [];

function animate(currentTime) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    checkCollisions();
    
    particles.forEach(particle => {
        particle.update(currentTime);
        particle.draw(ctx, currentTime);
    });
    
    const uncollapsed = particles.filter(p => !p.collapsed).length;
    const uncertainty = uncollapsed > 0 ? (uncollapsed * 47.3).toFixed(1) : '0';
    uncertaintyEl.textContent = `Uncertainty: ${uncertainty}ℏ`;
    
    const totalEnergy = particles.reduce((sum, p) => sum + p.energy, 0);
    energyEl.textContent = totalEnergy.toFixed(1);
    
    requestAnimationFrame(animate);
}

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
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

for (let i = 0; i < 3; i++) {
    particles.push(new QuantumParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
    ));
}
countEl.textContent = particles.length;

animate(0);