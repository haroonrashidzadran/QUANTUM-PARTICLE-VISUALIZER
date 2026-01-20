const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countEl = document.getElementById('count');
const uncertaintyEl = document.getElementById('uncertainty');

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
        } else {
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
            return true;
        }
        return false;
    }
}

const particles = [];

function animate(currentTime) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update(currentTime);
        particle.draw(ctx, currentTime);
    });
    
    const uncollapsed = particles.filter(p => !p.collapsed).length;
    const uncertainty = uncollapsed > 0 ? (uncollapsed * 47.3).toFixed(1) : '0';
    uncertaintyEl.textContent = `Uncertainty: ${uncertainty}ℏ`;
    
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
        particles.push(new QuantumParticle(x, y));
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