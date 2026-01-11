// Boids 算法模块 - 群体智能演示
// 基于 Craig Reynolds 的 Boids 算法实现

export class Vector2D {
  x: number;
  y: number;
  
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector2D): Vector2D {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector: Vector2D): Vector2D {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector2D {
    if (scalar === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return this.divide(mag);
  }

  limit(max: number): Vector2D {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return new Vector2D(this.x, this.y);
  }

  distance(vector: Vector2D): number {
    return this.subtract(vector).magnitude();
  }
}

export interface BoidsConfig {
  maxSpeed?: number;
  maxForce?: number;
  separationRadius?: number;
  alignmentRadius?: number;
  cohesionRadius?: number;
  separationWeight?: number;
  alignmentWeight?: number;
  cohesionWeight?: number;
  count?: number;
}

export class Boid {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  canvas: { width: number; height: number };
  maxSpeed: number;
  maxForce: number;
  separationRadius: number;
  alignmentRadius: number;
  cohesionRadius: number;
  size: number;
  paperPlaneColor: string;
  
  constructor(x: number, y: number, canvas: { width: number; height: number }, config: BoidsConfig = {}) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    this.acceleration = new Vector2D(0, 0);
    this.canvas = canvas;
    
    // Boids 参数（可配置）
    this.maxSpeed = config.maxSpeed || 2;
    this.maxForce = config.maxForce || 0.05;
    this.separationRadius = config.separationRadius || 30;
    this.alignmentRadius = config.alignmentRadius || 60;
    this.cohesionRadius = config.cohesionRadius || 60;
    
    // 视觉参数
    this.size = 12;
    this.paperPlaneColor = this.generatePaperPlaneColor();
  }

  generatePaperPlaneColor(): string {
    const colors = [
      '#94a3b8', // 蓝灰色
      '#a1a1aa', // 灰色
      '#9ca3af', // 中性灰
      '#94a3b8', // 蓝灰色
      '#a3a3a3', // 暖灰色
      '#9ca3af', // 冷灰色
      '#8b8f9c', // 深蓝灰
      '#9d9ea1'  // 浅灰色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update(boids: Boid[], weights: { separation: number; alignment: number; cohesion: number }) {
    // 计算三个主要力
    const separation = this.separate(boids).multiply(weights.separation);
    const alignment = this.align(boids).multiply(weights.alignment);
    const cohesion = this.cohesion(boids).multiply(weights.cohesion);

    // 应用力
    this.acceleration = separation.add(alignment).add(cohesion);
    
    // 更新速度和位置
    this.velocity = this.velocity.add(this.acceleration).limit(this.maxSpeed);
    this.position = this.position.add(this.velocity);
    
    // 重置加速度
    this.acceleration = this.acceleration.multiply(0);
    
    // 边界处理（环绕）
    this.wrapAround();
  }

  separate(boids: Boid[]): Vector2D {
    const steer = new Vector2D(0, 0);
    let count = 0;

    for (const other of boids) {
      const distance = this.position.distance(other.position);
      if (distance > 0.5 && distance < this.separationRadius) { // 最小距离阈值
        const diff = this.position.subtract(other.position)
          .normalize()
          .divide(Math.max(distance, 1)); // 避免除以很小的数
        steer.x += diff.x;
        steer.y += diff.y;
        count++;
      }
    }

    if (count > 0) {
      return steer.divide(count).normalize().multiply(this.maxSpeed).subtract(this.velocity).limit(this.maxForce);
    }
    return steer;
  }

  align(boids: Boid[]): Vector2D {
    const steer = new Vector2D(0, 0);
    let count = 0;

    for (const other of boids) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < this.alignmentRadius) {
        steer.x += other.velocity.x;
        steer.y += other.velocity.y;
        count++;
      }
    }

    if (count > 0) {
      return steer.divide(count).normalize().multiply(this.maxSpeed).subtract(this.velocity).limit(this.maxForce);
    }
    return steer;
  }

  cohesion(boids: Boid[]): Vector2D {
    const steer = new Vector2D(0, 0);
    let count = 0;

    for (const other of boids) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < this.cohesionRadius) {
        steer.x += other.position.x;
        steer.y += other.position.y;
        count++;
      }
    }

    if (count > 0) {
      const center = steer.divide(count);
      return this.seek(center);
    }
    return steer;
  }

  seek(target: Vector2D): Vector2D {
    const desired = target.subtract(this.position).normalize().multiply(this.maxSpeed);
    return desired.subtract(this.velocity).limit(this.maxForce);
  }

  wrapAround(): void {
    if (this.position.x < 0) this.position.x = this.canvas.width;
    if (this.position.x > this.canvas.width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = this.canvas.height;
    if (this.position.y > this.canvas.height) this.position.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, mousePosition?: Vector2D): void {
    const angle = Math.atan2(this.velocity.y, this.velocity.x);
    const speed = this.velocity.magnitude();
    let opacity = Math.min(0.6, 0.3 + speed * 0.05);
    
    // 检测鼠标悬停
    let isHovered = false;
    if (mousePosition) {
      const distance = this.position.distance(mousePosition);
      isHovered = distance < this.size * 2;
      if (isHovered) {
        opacity = Math.min(0.9, opacity + 0.4);
      }
    }
    
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);
    
    // 绘制纸飞机主体
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    // 机头（尖端）
    ctx.moveTo(this.size * 1.2, 0);
    // 上翼
    ctx.lineTo(-this.size * 0.6, -this.size * 0.4);
    ctx.lineTo(-this.size * 0.8, -this.size * 0.1);
    // 机身中线
    ctx.lineTo(-this.size * 0.3, 0);
    // 下翼  
    ctx.lineTo(-this.size * 0.8, this.size * 0.1);
    ctx.lineTo(-this.size * 0.6, this.size * 0.4);
    ctx.closePath();
    
    // 纸飞机主色
    ctx.fillStyle = this.paperPlaneColor;
    ctx.fill();
    
    // 绘制轮廓
    ctx.strokeStyle = isHovered ? '#64748b' : '#cbd5e1';
    ctx.lineWidth = isHovered ? 1.5 : 0.8;
    ctx.globalAlpha = isHovered ? 0.8 : 0.4;
    ctx.stroke();
    
    // 绘制纸飞机的折痕线
    ctx.strokeStyle = this.paperPlaneColor;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = opacity * 0.6;
    
    // 中线折痕
    ctx.beginPath();
    ctx.moveTo(this.size * 1.2, 0);
    ctx.lineTo(-this.size * 0.3, 0);
    ctx.stroke();
    
    // 翼的折痕
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.3, 0);
    ctx.lineTo(-this.size * 0.6, -this.size * 0.4);
    ctx.moveTo(-this.size * 0.3, 0);
    ctx.lineTo(-this.size * 0.6, this.size * 0.4);
    ctx.stroke();
    
    ctx.restore();
  }
}

export class BoidsSystem {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  boids: Boid[];
  animationId: number | null;
  weights: { separation: number; alignment: number; cohesion: number };
  mousePosition: Vector2D;
  config: BoidsConfig;
  
  constructor(canvas: HTMLCanvasElement, config: BoidsConfig = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.boids = [];
    this.animationId = null;
    this.config = config;
    
    this.weights = {
      separation: config.separationWeight || 1.5,
      alignment: config.alignmentWeight || 0.8,
      cohesion: config.cohesionWeight || 0.8
    };
    this.mousePosition = new Vector2D(-1000, -1000); // 初始化到屏幕外
    
    this.setupCanvas();
    this.initializeBoids(config.count || 30);
    this.setupMouseTracking();
    this.animate();
  }

  setupCanvas(): void {
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  initializeBoids(count: number): void {
    this.boids = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.canvas.width / window.devicePixelRatio;
      const y = Math.random() * this.canvas.height / window.devicePixelRatio;
      this.boids.push(new Boid(x, y, {
        width: this.canvas.width / window.devicePixelRatio,
        height: this.canvas.height / window.devicePixelRatio
      }, this.config));
    }
  }

  setupMouseTracking(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.mousePosition.x = -1000;
      this.mousePosition.y = -1000;
    });
  }

  animate(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制淡淡的网格背景
    this.drawBackground();
    
    // 更新和绘制所有 boids
    for (const boid of this.boids) {
      boid.update(this.boids, this.weights);
      boid.draw(this.ctx, this.mousePosition);
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawBackground(): void {
    const ctx = this.ctx;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    
    // 绘制淡淡的网格线
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.2)';
    ctx.lineWidth = 0.5;
    
    const gridSize = 40;
    
    // 垂直线
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // 水平线
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  updateWeights(newWeights: Partial<{ separation: number; alignment: number; cohesion: number }>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  updateBoidCount(count: number): void {
    this.initializeBoids(count);
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
