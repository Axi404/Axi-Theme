// Conway's Game of Life - 元胞自动机算法
// 经典的细胞自动机，展示简单规则产生复杂行为

export interface CellularAutomataConfig {
  cellSize?: number;
  updateInterval?: number;
  density?: number; // 初始存活细胞密度
  colors?: {
    alive: string;
    dead: string;
    grid: string;
  };
}

export class CellularAutomata {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  grid!: boolean[][];
  nextGrid!: boolean[][];
  rows!: number;
  cols!: number;
  cellSize: number;
  animationId: number | null;
  updateInterval: number;
  lastUpdate: number;
  config: CellularAutomataConfig;
  isRunning: boolean;
  generation: number;
  
  constructor(canvas: HTMLCanvasElement, config: CellularAutomataConfig = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = {
      cellSize: 8,
      updateInterval: 150,
      density: 0.3,
      colors: {
        alive: '#64748b',
        dead: 'transparent',
        grid: 'rgba(203, 213, 225, 0.2)'
      },
      ...config
    };
    
    this.cellSize = this.config.cellSize!;
    this.updateInterval = this.config.updateInterval!;
    this.animationId = null;
    this.lastUpdate = 0;
    this.isRunning = true;
    this.generation = 0;
    
    this.setupCanvas();
    this.initializeGrid();
    this.setupInteraction();
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
      
      // 重新计算网格大小
      const displayWidth = rect.width;
      const displayHeight = rect.height;
      this.cols = Math.floor(displayWidth / this.cellSize);
      this.rows = Math.floor(displayHeight / this.cellSize);
      
      // 重新初始化网格
      this.initializeGrid();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  initializeGrid(): void {
    this.grid = [];
    this.nextGrid = [];
    this.generation = 0;
    
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      this.nextGrid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        // 随机初始化，或者设置经典图案
        if (this.generation === 0) {
          this.grid[row][col] = Math.random() < this.config.density!;
        } else {
          this.grid[row][col] = false;
        }
        this.nextGrid[row][col] = false;
      }
    }
    
    // 添加一些经典图案
    this.addClassicPatterns();
  }

  addClassicPatterns(): void {
    const centerRow = Math.floor(this.rows / 2);
    const centerCol = Math.floor(this.cols / 2);
    
    // 滑翔机 (Glider)
    if (centerRow > 5 && centerCol > 5) {
      const gliderRow = centerRow - 10;
      const gliderCol = centerCol - 10;
      this.setCell(gliderRow, gliderCol + 1, true);
      this.setCell(gliderRow + 1, gliderCol + 2, true);
      this.setCell(gliderRow + 2, gliderCol, true);
      this.setCell(gliderRow + 2, gliderCol + 1, true);
      this.setCell(gliderRow + 2, gliderCol + 2, true);
    }
    
    // 振荡器 (Blinker)
    if (centerRow > 2 && centerCol > 2) {
      const blinkerRow = centerRow + 5;
      const blinkerCol = centerCol + 5;
      this.setCell(blinkerRow, blinkerCol, true);
      this.setCell(blinkerRow, blinkerCol + 1, true);
      this.setCell(blinkerRow, blinkerCol + 2, true);
    }
    
    // 静物方块 (Block)
    if (centerRow > 2 && centerCol > 2) {
      const blockRow = centerRow + 8;
      const blockCol = centerCol - 8;
      this.setCell(blockRow, blockCol, true);
      this.setCell(blockRow, blockCol + 1, true);
      this.setCell(blockRow + 1, blockCol, true);
      this.setCell(blockRow + 1, blockCol + 1, true);
    }
  }

  setCell(row: number, col: number, alive: boolean): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = alive;
    }
  }

  getCell(row: number, col: number): boolean {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return false; // 边界外视为死细胞
    }
    return this.grid[row][col];
  }

  countNeighbors(row: number, col: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue; // 跳过自己
        if (this.getCell(row + i, col + j)) {
          count++;
        }
      }
    }
    return count;
  }

  update(): void {
    // 计算下一代
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const neighbors = this.countNeighbors(row, col);
        const currentCell = this.grid[row][col];
        
        // Conway's Game of Life 规则
        if (currentCell) {
          // 活细胞
          this.nextGrid[row][col] = neighbors === 2 || neighbors === 3;
        } else {
          // 死细胞
          this.nextGrid[row][col] = neighbors === 3;
        }
      }
    }
    
    // 交换网格
    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    this.generation++;
  }

  draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制背景网格
    this.drawGrid();
    
    // 绘制细胞
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col]) {
          this.drawCell(row, col);
        }
      }
    }
    
    // 不显示代数信息
  }

  drawGrid(): void {
    this.ctx.strokeStyle = this.config.colors!.grid!;
    this.ctx.lineWidth = 0.5;
    
    const displayWidth = this.canvas.width / window.devicePixelRatio;
    const displayHeight = this.canvas.height / window.devicePixelRatio;
    
    // 垂直线
    for (let col = 0; col <= this.cols; col++) {
      const x = col * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, displayHeight);
      this.ctx.stroke();
    }
    
    // 水平线
    for (let row = 0; row <= this.rows; row++) {
      const y = row * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(displayWidth, y);
      this.ctx.stroke();
    }
  }

  drawCell(row: number, col: number): void {
    const x = col * this.cellSize;
    const y = row * this.cellSize;
    const padding = 0.5;
    const size = this.cellSize - 1;
    const cornerRadius = Math.min(3, this.cellSize * 0.25); // 圆角半径
    
    this.ctx.fillStyle = this.config.colors!.alive!;
    
    // 绘制圆角矩形
    this.ctx.beginPath();
    this.ctx.roundRect(x + padding, y + padding, size, size, cornerRadius);
    this.ctx.fill();
    
    // 添加轻微的高光效果
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.beginPath();
    this.ctx.roundRect(x + padding, y + padding, size, 2, [cornerRadius, cornerRadius, 0, 0]);
    this.ctx.fill();
  }

  drawInfo(): void {
    // 不显示任何信息
  }

  setupInteraction(): void {
    let isDrawing = false;
    
    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      this.handleDrawing(e);
    };
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDrawing) {
        this.handleDrawing(e);
      }
    };
    
    const handleEnd = () => {
      isDrawing = false;
    };
    
    this.canvas.addEventListener('mousedown', handleStart);
    this.canvas.addEventListener('mousemove', handleMove);
    this.canvas.addEventListener('mouseup', handleEnd);
    this.canvas.addEventListener('mouseleave', handleEnd);
    
    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleStart(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      handleMove(e);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleEnd();
    });
    
    // 双击重置
    this.canvas.addEventListener('dblclick', () => {
      this.reset();
    });
  }

  handleDrawing(e: MouseEvent | TouchEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = true; // 总是设置为活细胞
    }
  }

  animate(): void {
    const currentTime = Date.now();
    
    if (this.isRunning && currentTime - this.lastUpdate > this.updateInterval) {
      this.update();
      this.lastUpdate = currentTime;
    }
    
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  toggleRunning(): void {
    this.isRunning = !this.isRunning;
  }

  step(): void {
    this.update();
  }

  reset(): void {
    this.initializeGrid();
    this.generation = 0;
  }

  clear(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = false;
      }
    }
    this.generation = 0;
  }

  randomize(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = Math.random() < this.config.density!;
      }
    }
    this.generation = 0;
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
