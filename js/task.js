// js/task.js
export class TaskManager {
  constructor() {
    // ذخیره وظایف در localStorage
    this.storageKey = 'taskManagerTasks';
    
    // بارگذاری وظایف از localStorage
    this.tasks = this.loadTasks();
    
    // فیلترهای پیش‌فرض
    this.statusFilter = 'all'; // 'all', 'active', 'completed'
    this.priorityFilter = 'all'; // 'all', 'high', 'medium', 'low'
    
    console.log('TaskManager initialized with', this.tasks.length, 'tasks');
  }

  // بارگذاری وظایف از localStorage
  loadTasks() {
    const storedTasks = localStorage.getItem(this.storageKey);
    return storedTasks ? JSON.parse(storedTasks) : [];
  }

  // ذخیره وظایف در localStorage
  saveTasks() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
  }

  // دریافت همه وظایف
  getTasks() {
    return [...this.tasks];
  }

  // دریافت وظایف فیلتر شده
  getFilteredTasks() {
    return this.tasks.filter(task => {
      // فیلتر وضعیت
      if (this.statusFilter === 'active' && task.completed) return false;
      if (this.statusFilter === 'completed' && !task.completed) return false;
      
      // فیلتر اولویت
      if (this.priorityFilter !== 'all' && task.priority !== this.priorityFilter) return false;
      
      return true;
    });
  }

  // تنظیم فیلتر وضعیت
  setStatusFilter(filter) {
    this.statusFilter = filter;
    return this;
  }

  // تنظیم فیلتر اولویت
  setPriorityFilter(filter) {
    this.priorityFilter = filter;
    return this;
  }

  // افزودن وظیفه جدید
  async addTask(taskData) {
    // ایجاد شبیه‌سازی تأخیر شبکه
    await this.simulateNetworkDelay();
    
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate || null,
      priority: taskData.priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    this.tasks.push(newTask);
    this.saveTasks();
    
    return newTask;
  }

  // دریافت یک وظیفه با شناسه
  getTaskById(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (!task) throw new Error('وظیفه مورد نظر یافت نشد');
    return task;
  }

  // تغییر وضعیت تکمیل وظیفه
  async toggleTaskCompletion(taskId) {
    // ایجاد شبیه‌سازی تأخیر شبکه
    await this.simulateNetworkDelay();
    
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) throw new Error('وظیفه مورد نظر یافت نشد');
    
    // تغییر وضعیت وظیفه
    this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
    
    // اگر وظیفه تکمیل شده، تاریخ تکمیل را ثبت کنیم
    if (this.tasks[taskIndex].completed) {
      this.tasks[taskIndex].completedAt = new Date().toISOString();
    } else {
      delete this.tasks[taskIndex].completedAt;
    }
    
    this.saveTasks();
    return this.tasks[taskIndex];
  }

  // به‌روزرسانی اطلاعات وظیفه
  async updateTask(taskId, updatedData) {
    // ایجاد شبیه‌سازی تأخیر شبکه
    await this.simulateNetworkDelay();
    
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) throw new Error('وظیفه مورد نظر یافت نشد');
    
    // به‌روزرسانی فیلدهای مجاز
    if (updatedData.title !== undefined) {
      this.tasks[taskIndex].title = updatedData.title;
    }
    
    if (updatedData.description !== undefined) {
      this.tasks[taskIndex].description = updatedData.description;
    }
    
    if (updatedData.dueDate !== undefined) {
      this.tasks[taskIndex].dueDate = updatedData.dueDate;
    }
    
    if (updatedData.priority !== undefined) {
      this.tasks[taskIndex].priority = updatedData.priority;
    }
    
    // ثبت زمان آخرین به‌روزرسانی
    this.tasks[taskIndex].updatedAt = new Date().toISOString();
    
    this.saveTasks();
    return this.tasks[taskIndex];
  }

  // حذف وظیفه
  async deleteTask(taskId) {
    // ایجاد شبیه‌سازی تأخیر شبکه
    await this.simulateNetworkDelay();
    
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) throw new Error('وظیفه مورد نظر یافت نشد');
    
    // حذف وظیفه از آرایه
    const deletedTask = this.tasks.splice(taskIndex, 1)[0];
    
    this.saveTasks();
    return deletedTask;
  }

  // حذف همه وظایف تکمیل شده
  async clearCompletedTasks() {
    // ایجاد شبیه‌سازی تأخیر شبکه
    await this.simulateNetworkDelay();
    
    // فیلتر کردن وظایف و نگه داشتن فقط وظایف تکمیل نشده
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => !task.completed);
    
    this.saveTasks();
    return initialLength - this.tasks.length; // تعداد وظایف حذف شده
  }

  // جستجوی وظایف
  searchTasks(query) {
    if (!query) return this.getFilteredTasks();
    
    const searchTerm = query.toLowerCase();
    return this.getFilteredTasks().filter(task => 
      task.title.toLowerCase().includes(searchTerm) || 
      task.description.toLowerCase().includes(searchTerm)
    );
  }

  // دریافت آمار وظایف
  getTasksStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const highPriorityTasks = this.tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = this.tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = this.tasks.filter(task => task.priority === 'low').length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      highPriority: highPriorityTasks,
      mediumPriority: mediumPriorityTasks,
      lowPriority: lowPriorityTasks,
      completionRate
    };
  }

  // مرتب‌سازی وظایف
  sortTasks(criteria = 'createdAt', ascending = false) {
    const sortedTasks = [...this.tasks];
    
    sortedTasks.sort((a, b) => {
      let valueA, valueB;
      
      switch (criteria) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
          
        case 'dueDate':
          valueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          break;
          
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1 };
          valueA = priorityValues[a.priority] || 0;
          valueB = priorityValues[b.priority] || 0;
          break;
          
        default: // createdAt
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
      }
      
      // مرتب‌سازی صعودی یا نزولی
      if (ascending) {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return sortedTasks;
  }

  // شبیه‌سازی تأخیر شبکه برای عملیات‌های async
  simulateNetworkDelay(minMs = 200, maxMs = 600) {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export default TaskManager;