// A* 寻路算法 - 智能路径规划算法
// 结合了 Dijkstra 算法的准确性和贪心搜索的效率

export interface AStarConfig {
  gridSize?: number;
  animationSpeed?: number;
  allowDiagonal?: boolean;
  colors?: {
    wall: string;
    start: string;
    end: string;
    path: string;
    visited: string;
    current: string;
    open: string;
    grid: string;
  };
}

export enum CellType {
  Empty = 0,
  Wall = 1,
  Start = 2,
  End = 3,
  Path = 4,
  Visited = 5,
  Current = 6,
  Open = 7
}

export class GridNode {
  x: number;
  y: number;
  type: CellType;
  f: number = 0; // f = g + h
  g: number = 0; // 从起点到当前节点的实际距离
  h: number = 0; // 从当前节点到终点的启发式距离
  parent: GridNode | null = null;

  constructor(x: number, y: number, type: CellType = CellType.Empty) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  reset(clearWalls: boolean = false): void {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = null;
    if (this.type === CellType.Visited || this.type === CellType.Current || 
        this.type === CellType.Open || this.type === CellType.Path ||
        (clearWalls && this.type === CellType.Wall)) {
      this.type = CellType.Empty;
    }
  }
}

export class AStar {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  grid!: GridNode[][];
  rows!: number;
  cols!: number;
  gridSize: number;
  animationId: number | null;
  config: AStarConfig;
  
  // 算法状态
  start: GridNode | null = null;
  end: GridNode | null = null;
  openSet: GridNode[] = [];
  closedSet: Set<GridNode> = new Set();
  path: GridNode[] = [];
  isRunning: boolean = false;
  isComplete: boolean = false;
  
  // 交互状态
  isDragging: boolean = false;
  dragMode: 'wall' | 'erase' | null = null;
  
  constructor(canvas: HTMLCanvasElement, config: AStarConfig = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = {
      gridSize: 20,
      animationSpeed: 50,
      allowDiagonal: false,
      colors: {
        wall: '#475569',
        start: '#10b981',
        end: '#ef4444',
        path: '#3b82f6',
        visited: 'rgba(239, 68, 68, 0.3)',
        current: '#f59e0b',
        open: 'rgba(16, 185, 129, 0.3)',
        grid: 'rgba(203, 213, 225, 0.3)'
      },
      ...config
    };
    
    this.gridSize = this.config.gridSize!;
    this.animationId = null;
    
    this.setupCanvas();
    this.initializeGrid();
    this.setupInteraction();
    this.generateMaze();
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
      
      const displayWidth = rect.width;
      const displayHeight = rect.height;
      this.cols = Math.floor(displayWidth / this.gridSize);
      this.rows = Math.floor(displayHeight / this.gridSize);
      
      this.initializeGrid();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  initializeGrid(): void {
    this.grid = [];
    this.start = null;
    this.end = null;
    this.openSet = [];
    this.closedSet.clear();
    this.path = [];
    this.isRunning = false;
    this.isComplete = false;
    
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = new GridNode(col, row);
      }
    }
  }

  generateMaze(): void {
    // 清空现有状态，包括墙壁
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col].reset(true);
      }
    }
    
    this.openSet = [];
    this.closedSet.clear();
    this.path = [];
    this.isRunning = false;
    this.isComplete = false;
    
    // 随机生成一些墙壁
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (Math.random() < 0.3) {
          this.grid[row][col].type = CellType.Wall;
        }
      }
    }
    
    // 设置起点和终点
    const startRow = Math.floor(this.rows * 0.2);
    const startCol = Math.floor(this.cols * 0.2);
    const endRow = Math.floor(this.rows * 0.8);
    const endCol = Math.floor(this.cols * 0.8);
    
    this.start = this.grid[startRow][startCol];
    this.start.type = CellType.Start;
    
    this.end = this.grid[endRow][endCol];
    this.end.type = CellType.End;
    
    // 确保起点和终点周围没有墙
    this.clearAroundPoint(startRow, startCol);
    this.clearAroundPoint(endRow, endCol);
  }

  clearAroundPoint(row: number, col: number): void {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (this.isValidPosition(newRow, newCol)) {
          const node = this.grid[newRow][newCol];
          if (node.type === CellType.Wall) {
            node.type = CellType.Empty;
          }
        }
      }
    }
  }

  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  getNeighbors(node: GridNode): GridNode[] {
    const neighbors: GridNode[] = [];
    const directions = this.config.allowDiagonal 
      ? [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]]
      : [[-1,0], [0,-1], [0,1], [1,0]];
    
    for (const [dx, dy] of directions) {
      const newRow = node.y + dy;
      const newCol = node.x + dx;
      
      if (this.isValidPosition(newRow, newCol)) {
        const neighbor = this.grid[newRow][newCol];
        if (neighbor.type !== CellType.Wall) {
          neighbors.push(neighbor);
        }
      }
    }
    
    return neighbors;
  }

  heuristic(nodeA: GridNode, nodeB: GridNode): number {
    if (this.config.allowDiagonal) {
      // 使用对角距离（Chebyshev distance）
      return Math.max(Math.abs(nodeA.x - nodeB.x), Math.abs(nodeA.y - nodeB.y));
    } else {
      // 使用曼哈顿距离
      return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
    }
  }

  distance(nodeA: GridNode, nodeB: GridNode): number {
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  reconstructPath(node: GridNode): GridNode[] {
    const path: GridNode[] = [];
    let current = node;
    
    while (current) {
      path.unshift(current);
      current = current.parent!;
    }
    
    return path;
  }

  async findPath(): Promise<boolean> {
    if (!this.start || !this.end || this.isRunning) return false;
    
    this.reset();
    this.isRunning = true;
    this.isComplete = false;
    
    this.openSet = [this.start];
    this.start.g = 0;
    this.start.h = this.heuristic(this.start, this.end);
    this.start.f = this.start.g + this.start.h;
    
    while (this.openSet.length > 0 && this.isRunning) {
      // 找到 f 值最小的节点
      let current = this.openSet[0];
      let currentIndex = 0;
      
      for (let i = 1; i < this.openSet.length; i++) {
        if (this.openSet[i].f < current.f) {
          current = this.openSet[i];
          currentIndex = i;
        }
      }
      
      // 从开放集合中移除当前节点
      this.openSet.splice(currentIndex, 1);
      this.closedSet.add(current);
      
      // 标记当前节点
      if (current.type !== CellType.Start && current.type !== CellType.End) {
        current.type = CellType.Current;
      }
      
      // 检查是否到达终点
      if (current === this.end) {
        this.path = this.reconstructPath(current);
        this.markPath();
        this.isComplete = true;
        this.isRunning = false;
        return true;
      }
      
      // 检查所有邻居
      const neighbors = this.getNeighbors(current);
      
      for (const neighbor of neighbors) {
        if (this.closedSet.has(neighbor)) continue;
        
        const tentativeG = current.g + this.distance(current, neighbor);
        
        if (!this.openSet.includes(neighbor)) {
          this.openSet.push(neighbor);
          if (neighbor.type !== CellType.Start && neighbor.type !== CellType.End) {
            neighbor.type = CellType.Open;
          }
        } else if (tentativeG >= neighbor.g) {
          continue;
        }
        
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = this.heuristic(neighbor, this.end);
        neighbor.f = neighbor.g + neighbor.h;
      }
      
      // 标记已访问的节点
      if (current.type === CellType.Current && current !== this.start && current !== this.end) {
        current.type = CellType.Visited;
      }
      
      // 添加延迟以显示动画
      await new Promise(resolve => setTimeout(resolve, this.config.animationSpeed));
    }
    
    this.isRunning = false;
    return false;
  }

  markPath(): void {
    for (const node of this.path) {
      if (node.type !== CellType.Start && node.type !== CellType.End) {
        node.type = CellType.Path;
      }
    }
  }

  reset(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col].reset();
      }
    }
    
    this.openSet = [];
    this.closedSet.clear();
    this.path = [];
    this.isRunning = false;
    this.isComplete = false;
  }

  draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制网格
    this.drawGrid();
    
    // 绘制所有单元格
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.drawCell(this.grid[row][col]);
      }
    }
  }

  drawGrid(): void {
    this.ctx.strokeStyle = this.config.colors!.grid!;
    this.ctx.lineWidth = 0.5;
    
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    
    // 垂直线
    for (let col = 0; col <= this.cols; col++) {
      const x = col * this.gridSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    
    // 水平线
    for (let row = 0; row <= this.rows; row++) {
      const y = row * this.gridSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  drawCell(node: GridNode): void {
    const x = node.x * this.gridSize;
    const y = node.y * this.gridSize;
    const padding = 1;
    const size = this.gridSize - 2;
    const cornerRadius = 3;
    
    let color = '';
    
    switch (node.type) {
      case CellType.Wall:
        color = this.config.colors!.wall!;
        break;
      case CellType.Start:
        color = this.config.colors!.start!;
        break;
      case CellType.End:
        color = this.config.colors!.end!;
        break;
      case CellType.Path:
        color = this.config.colors!.path!;
        break;
      case CellType.Visited:
        color = this.config.colors!.visited!;
        break;
      case CellType.Current:
        color = this.config.colors!.current!;
        break;
      case CellType.Open:
        color = this.config.colors!.open!;
        break;
      default:
        return; // 空单元格不绘制
    }
    
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(x + padding, y + padding, size, size, cornerRadius);
    this.ctx.fill();
    
    // 为起点和终点添加图标
    if (node.type === CellType.Start || node.type === CellType.End) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = `${this.gridSize * 0.6}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const icon = node.type === CellType.Start ? '▶' : '◼';
      this.ctx.fillText(icon, x + this.gridSize / 2, y + this.gridSize / 2);
    }
  }

  setupInteraction(): void {
    let isDrawing = false;
    
    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      this.handleInteraction(e);
    };
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDrawing) {
        this.handleInteraction(e);
      }
    };
    
    const handleEnd = () => {
      isDrawing = false;
      this.dragMode = null;
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
    
    // 双击重新生成迷宫
    this.canvas.addEventListener('dblclick', () => {
      this.generateMaze();
      // 自动开始新的寻路
      setTimeout(() => {
        this.startPathfinding();
      }, 500);
    });
  }

  handleInteraction(e: MouseEvent | TouchEvent): void {
    if (this.isRunning) return;
    
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
    
    const col = Math.floor(x / this.gridSize);
    const row = Math.floor(y / this.gridSize);
    
    if (!this.isValidPosition(row, col)) return;
    
    const node = this.grid[row][col];
    
    // 确定拖拽模式
    if (this.dragMode === null) {
      if (node.type === CellType.Empty) {
        this.dragMode = 'wall';
      } else if (node.type === CellType.Wall) {
        this.dragMode = 'erase';
      }
    }
    
    // 应用拖拽操作
    if (this.dragMode === 'wall' && node.type === CellType.Empty) {
      node.type = CellType.Wall;
    } else if (this.dragMode === 'erase' && node.type === CellType.Wall) {
      node.type = CellType.Empty;
    }
  }

  animate(): void {
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  async startPathfinding(): Promise<void> {
    if (!this.isRunning && this.start && this.end) {
      await this.findPath();
    }
  }

  stop(): void {
    this.isRunning = false;
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
