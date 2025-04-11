// js/ui.js
export class UI {
  constructor(taskManager) {
    // ذخیره مرجع به مدیریت وظایف
    this.taskManager = taskManager;
    
    // گرفتن مراجع DOM
    this.taskForm = document.getElementById('task-form');
    this.tasksList = document.getElementById('tasks-list');
    
    // دکمه‌های فیلتر وضعیت
    this.filterAllBtn = document.getElementById('filter-all');
    this.filterActiveBtn = document.getElementById('filter-active');
    this.filterCompletedBtn = document.getElementById('filter-completed');
    
    // دکمه‌های فیلتر اولویت
    this.filterPriorityAllBtn = document.getElementById('filter-priority-all');
    this.filterPriorityHighBtn = document.getElementById('filter-priority-high');
    this.filterPriorityMediumBtn = document.getElementById('filter-priority-medium');
    this.filterPriorityLowBtn = document.getElementById('filter-priority-low');
    
    this.loader = document.getElementById('loader');
    
    // وضعیت فیلترهای فعلی
    this.currentStatusFilter = 'all';
    this.currentPriorityFilter = 'all';
  }

  // متد جدید برای راه‌اندازی UI
  initialize() {
    // تنظیم event listeners
    this.setupEventListeners();
    
    // بارگذاری اولیه وظایف
    this.updateUI();
    
    // نمایش فیلترهای فعال
    this.updateActiveFilters();
    
    // به‌روزرسانی اولیه آمار و شمارنده‌ها
    this.updateTaskCounter();
    this.updateStats();
    
    // نمایش پیام خوش‌آمدگویی
    this.showNotification('به برنامه مدیریت وظایف خوش آمدید!', 'info', 5000);
    
    console.log('UI initialized successfully');
    return this;
  }

  // تنظیم تمام رویدادها
  setupEventListeners() {
    // ارسال فرم افزودن وظیفه
    if (this.taskForm) {
      this.taskForm.addEventListener('submit', this.handleAddTask.bind(this));
    }
    
    // رویدادهای فیلتر وضعیت
    if (this.filterAllBtn) {
      this.filterAllBtn.addEventListener('click', () => this.handleFilterChange('all'));
    }
    if (this.filterActiveBtn) {
      this.filterActiveBtn.addEventListener('click', () => this.handleFilterChange('active'));
    }
    if (this.filterCompletedBtn) {
      this.filterCompletedBtn.addEventListener('click', () => this.handleFilterChange('completed'));
    }
    
    // رویدادهای فیلتر اولویت
    if (this.filterPriorityAllBtn) {
      this.filterPriorityAllBtn.addEventListener('click', () => this.handlePriorityFilterChange('all'));
    }
    if (this.filterPriorityHighBtn) {
      this.filterPriorityHighBtn.addEventListener('click', () => this.handlePriorityFilterChange('high'));
    }
    if (this.filterPriorityMediumBtn) {
      this.filterPriorityMediumBtn.addEventListener('click', () => this.handlePriorityFilterChange('medium'));
    }
    if (this.filterPriorityLowBtn) {
      this.filterPriorityLowBtn.addEventListener('click', () => this.handlePriorityFilterChange('low'));
    }
  }

  // نمایش/پنهان‌سازی لودر
  toggleLoader(show = true) {
    if (this.loader) {
      this.loader.classList.toggle('hidden', !show);
    }
  }

  // رسم وظایف
  renderTasks(tasks) {
    // پاک‌سازی لیست فعلی
    if (!this.tasksList) return;
    
    this.tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'col-span-full text-center py-8 text-gray-500';
      emptyMessage.textContent = 'هیچ وظیفه‌ای یافت نشد';
      this.tasksList.appendChild(emptyMessage);
      return;
    }
    
    // ایجاد کارت برای هر وظیفه
    tasks.forEach(task => {
      const { id, title, description, dueDate, completed, priority = 'medium' } = task;
      
      // ایجاد المان کارت
      const taskCard = document.createElement('div');
      taskCard.className = `task-card p-4 rounded-lg shadow-md transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${
        completed ? 'bg-green-50' : 'bg-white'
      } border-r-4 priority-${priority}`;
      taskCard.dataset.id = id;
      
      // نشانگر اولویت
      let priorityLabel, priorityColor;
      switch (priority) {
        case 'high':
          priorityLabel = 'بالا';
          priorityColor = 'text-red-500';
          break;
        case 'medium':
          priorityLabel = 'متوسط';
          priorityColor = 'text-yellow-500';
          break;
        case 'low':
          priorityLabel = 'پایین';
          priorityColor = 'text-green-500';
          break;
        default:
          priorityLabel = 'متوسط';
          priorityColor = 'text-yellow-500';
      }
      
      // ساخت محتوای کارت با استفاده از template literals
      taskCard.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-bold ${completed ? 'line-through text-gray-500' : 'text-gray-800'}">${title}</h3>
          <div class="flex space-x-2">
            <button class="toggle-btn w-6 h-6 rounded-full flex items-center justify-center ${
              completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button class="edit-btn text-blue-500 hover:text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="delete-btn text-red-500 hover:text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <p class="mb-2 text-gray-600 text-sm">${description || 'بدون توضیحات'}</p>
        
        <div class="flex flex-wrap gap-2 mt-3">
          <span class="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 ${priorityColor}">
            اولویت: ${priorityLabel}
          </span>
          
          ${dueDate ? `
          <span class="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            تاریخ انجام: ${new Date(dueDate).toLocaleDateString('fa-IR')}
          </span>
          ` : ''}
          
          <span class="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 ${completed ? 'text-green-600' : 'text-blue-600'}">
            ${completed ? 'تکمیل شده' : 'در حال انجام'}
          </span>
        </div>
      `;
      
      // افزودن event listeners به دکمه‌های کارت
      const toggleBtn = taskCard.querySelector('.toggle-btn');
      const editBtn = taskCard.querySelector('.edit-btn');
      const deleteBtn = taskCard.querySelector('.delete-btn');
      
      toggleBtn.addEventListener('click', () => this.handleToggleTask(id));
      editBtn.addEventListener('click', () => this.handleEditTask(task));
      deleteBtn.addEventListener('click', () => this.handleDeleteTask(id));
      
      // افزودن کارت به لیست
      this.tasksList.appendChild(taskCard);
    });
  }

  // مدیریت افزودن وظیفه
  async handleAddTask(event) {
    event.preventDefault();
    
    // گرفتن مقادیر فرم
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const dueDateInput = document.getElementById('task-due-date');
    const priorityInput = document.getElementById('task-priority');
    
    if (!titleInput || !priorityInput) {
      console.error('Form elements not found');
      return;
    }
    
    const title = titleInput.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const dueDate = dueDateInput ? dueDateInput.value : null;
    const priority = priorityInput.value;
    
    if (!title) {
      alert('لطفاً عنوان وظیفه را وارد کنید');
      return;
    }
    
    try {
      this.toggleLoader(true);
      
      // ساخت داده‌های وظیفه
      const taskData = {
        title,
        description,
        dueDate: dueDate || null,
        priority
      };
      
      // افزودن وظیفه و به‌روزرسانی UI
      await this.taskManager.addTask(taskData);
      const filteredTasks = this.taskManager.getFilteredTasks();
      this.renderTasks(filteredTasks);
      this.updateTaskCounter();
      this.updateStats();
      
      // نمایش پیام موفقیت
      this.showNotification('وظیفه با موفقیت افزوده شد', 'success');
      
      // پاک‌سازی فرم
      this.taskForm.reset();
      priorityInput.value = 'medium'; // بازنشانی اولویت به مقدار پیش‌فرض
      
    } catch (error) {
      console.error('Error adding task:', error);
      this.showNotification(`خطا در افزودن وظیفه: ${error.message}`, 'error');
    } finally {
      this.toggleLoader(false);
    }
  }

  // تغییر وضعیت وظیفه
  async handleToggleTask(taskId) {
    try {
      this.toggleLoader(true);
      await this.taskManager.toggleTaskCompletion(taskId);
      const filteredTasks = this.taskManager.getFilteredTasks();
      this.renderTasks(filteredTasks);
      this.updateTaskCounter();
      this.updateStats();
    } catch (error) {
      console.error('Error toggling task:', error);
      this.showNotification(`خطا در تغییر وضعیت وظیفه: ${error.message}`, 'error');
    } finally {
      this.toggleLoader(false);
    }
  }

  // ویرایش وظیفه
  async handleEditTask(task) {
    // این متد را می‌توان با یک مودال یا فرم بهبود بخشید
    const newTitle = prompt('عنوان جدید:', task.title);
    if (newTitle === null) return; // لغو عملیات
    
    const newDescription = prompt('توضیحات جدید:', task.description || '');
    if (newDescription === null) return; // لغو عملیات
    
    // انتخاب اولویت جدید
    const priorities = ['low', 'medium', 'high'];
    const priorityLabels = {
      low: 'کم',
      medium: 'متوسط',
      high: 'بالا'
    };
    
    let priorityMessage = 'اولویت جدید را انتخاب کنید:\n';
    priorities.forEach((p, index) => {
      priorityMessage += `${index + 1}. ${priorityLabels[p]}\n`;
    });
    
    const priorityChoice = prompt(priorityMessage, task.priority ? 
      priorities.indexOf(task.priority) + 1 : 2); // پیش‌فرض: متوسط
    
    if (priorityChoice === null) return; // لغو عملیات
    
    const newPriority = priorities[parseInt(priorityChoice) - 1] || 'medium';
    
    // انتخاب تاریخ جدید
    const currentDate = task.dueDate ? task.dueDate.split('T')[0] : '';
    const newDueDate = prompt('تاریخ انجام (YYYY-MM-DD):', currentDate);
    
    try {
      this.toggleLoader(true);
      
      // به‌روزرسانی وظیفه
      await this.taskManager.updateTask(task.id, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        dueDate: newDueDate || null,
        priority: newPriority
      });
      
      // به‌روزرسانی UI
      const filteredTasks = this.taskManager.getFilteredTasks();
      this.renderTasks(filteredTasks);
      this.updateTaskCounter();
      this.updateStats();
      
      // نمایش پیام موفقیت
      this.showNotification('وظیفه با موفقیت به‌روزرسانی شد', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      this.showNotification(`خطا در ویرایش وظیفه: ${error.message}`, 'error');
    } finally {
      this.toggleLoader(false);
    }
  }

  // حذف وظیفه
  async handleDeleteTask(taskId) {
    const confirmation = confirm('آیا از حذف این وظیفه اطمینان دارید؟');
    if (!confirmation) return;
    
    try {
      this.toggleLoader(true);
      await this.taskManager.deleteTask(taskId);
      
      // به‌روزرسانی UI
      const filteredTasks = this.taskManager.getFilteredTasks();
      this.renderTasks(filteredTasks);
      this.updateTaskCounter();
      this.updateStats();
      
      // نمایش پیام موفقیت
      this.showNotification('وظیفه با موفقیت حذف شد', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      this.showNotification(`خطا در حذف وظیفه: ${error.message}`, 'error');
    } finally {
      this.toggleLoader(false);
    }
  }

  // مدیریت تغییر فیلتر وضعیت
  handleFilterChange(filterType) {
    // ذخیره فیلتر فعلی
    this.currentStatusFilter = filterType;
    
    // اعمال فیلتر در مدیریت وظایف
    this.taskManager.setStatusFilter(filterType);
    const filteredTasks = this.taskManager.getFilteredTasks();
    
    // به‌روزرسانی نمایش فیلترهای فعال
    this.updateActiveFilters();
    
    // به‌روزرسانی نمایش وظایف
    this.renderTasks(filteredTasks);
    
    // نمایش وضعیت فیلتر در UI
    this.showFilterStatus();
  }

  // مدیریت تغییر فیلتر اولویت
  handlePriorityFilterChange(priorityFilter) {
    // ذخیره فیلتر فعلی
    this.currentPriorityFilter = priorityFilter;
    
    // اعمال فیلتر در مدیریت وظایف
    this.taskManager.setPriorityFilter(priorityFilter);
    const filteredTasks = this.taskManager.getFilteredTasks();
    
    // به‌روزرسانی نمایش فیلترهای فعال
    this.updateActiveFilters();
    
    // به‌روزرسانی نمایش وظایف
    this.renderTasks(filteredTasks);
    
    // نمایش وضعیت فیلتر در UI
    this.showFilterStatus();
  }

  // به‌روزرسانی نمایش فیلترهای فعال
  // به‌روزرسانی نمایش فیلترهای فعال
// به‌روزرسانی نمایش فیلترهای فعال با طراحی حرفه‌ای آبی-سفید
updateActiveFilters() {
  const baseClasses = ['transition-all', 'duration-200', 'px-4', 'py-2', 'rounded-xl', 'text-sm', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-300'];

  const statusBtns = [
    { btn: this.filterAllBtn, filter: 'all' },
    { btn: this.filterActiveBtn, filter: 'active' },
    { btn: this.filterCompletedBtn, filter: 'completed' }
  ];

  statusBtns.forEach(({ btn, filter }) => {
    if (btn) {
      btn.className = ''; // حذف تمام کلاس‌ها
      btn.classList.add(...baseClasses);

      if (this.currentStatusFilter === filter) {
        btn.classList.add('bg-blue-500', 'text-white', 'shadow-lg');
      } else {
        btn.classList.add('bg-white', 'text-blue-500', 'border', 'border-blue-300', 'hover:bg-blue-500', 'hover:text-white');
      }
    }
  });

  const priorityBtns = [
    { btn: this.filterPriorityAllBtn, filter: 'all' },
    { btn: this.filterPriorityHighBtn, filter: 'high' },
    { btn: this.filterPriorityMediumBtn, filter: 'medium' },
    { btn: this.filterPriorityLowBtn, filter: 'low' }
  ];

  priorityBtns.forEach(({ btn, filter }) => {
    if (btn) {
      btn.className = ''; // حذف تمام کلاس‌ها
      btn.classList.add(...baseClasses);

      if (this.currentPriorityFilter === filter) {
        btn.classList.add('bg-blue-500', 'text-white', 'shadow-lg');
      } else {
        btn.classList.add('bg-white', 'text-blue-500', 'border', 'border-blue-300', 'hover:bg-blue-500', 'hover:text-white');
      }
    }
  });
}

  // نمایش وضعیت فیلتر در UI
  showFilterStatus() {
    // ایجاد یا به‌روزرسانی المان نمایش وضعیت فیلتر
    let filterStatusElement = document.getElementById('filter-status');
    
    if (!filterStatusElement) {
      filterStatusElement = document.createElement('div');
      filterStatusElement.id = 'filter-status';
      filterStatusElement.className = 'mb-4 p-2 bg-gray-100 rounded-lg text-sm';
      
      // افزودن به بالای لیست وظایف
      if (this.tasksList && this.tasksList.parentNode) {
        this.tasksList.parentNode.insertBefore(filterStatusElement, this.tasksList);
      }
    }
    
    // تولید متن وضعیت فیلتر
    let statusText = 'فیلترهای فعال: ';
    const statusLabels = {
      all: 'همه',
      active: 'در حال انجام',
      completed: 'تکمیل شده'
    };
    
    const priorityLabels = {
      all: 'همه',
      high: 'اولویت بالا',
      medium: 'اولویت متوسط',
      low: 'اولویت پایین'
    };
    
    statusText += `وضعیت: <strong>${statusLabels[this.currentStatusFilter]}</strong>، `;
    statusText += `اولویت: <strong>${priorityLabels[this.currentPriorityFilter]}</strong>`;
    
    filterStatusElement.innerHTML = statusText;
  }

  // به‌روزرسانی UI با اطلاعات جدید
  updateUI() {
    const filteredTasks = this.taskManager.getFilteredTasks();
    this.renderTasks(filteredTasks);
    this.showFilterStatus();
  }

  // نمایش یک پیام موقتی
  showNotification(message, type = 'info', duration = 3000) {
    // ایجاد یک اعلان موقت
    const notification = document.createElement('div');
    notification.className = `notification ${type} fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white opacity-0 transition-opacity duration-300`;
    
    // تنظیم رنگ بر اساس نوع
    switch (type) {
      case 'success':
        notification.classList.add('bg-green-500');
        break;
      case 'error':
        notification.classList.add('bg-red-500');
        break;
      case 'warning':
        notification.classList.add('bg-yellow-500');
        break;
      default:
        notification.classList.add('bg-blue-500');
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // آنیمیشن ورود
    setTimeout(() => {
      notification.classList.add('opacity-100');
    }, 10);
    
    // حذف پس از مدت زمان مشخص
    setTimeout(() => {
      notification.classList.remove('opacity-100');
      notification.classList.add('opacity-0');
      
      // حذف از DOM پس از پایان آنیمیشن
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  // نمایش تعداد وظایف
  updateTaskCounter() {
    const counter = document.getElementById('task-counter');
    if (!counter) return;
    
    const totalTasks = this.taskManager.getTasks().length;
    const completedTasks = this.taskManager.getTasks().filter(task => task.completed).length;
    
    counter.textContent = `${completedTasks} / ${totalTasks}`;
  }

  // به‌روزرسانی جدول آمار
  updateStats() {
    const tasks = this.taskManager.getTasks();
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    // محاسبه آمار
    const totalTasks = tasks.length;
    if (totalTasks === 0) {
      statsContainer.innerHTML = '<p class="text-center text-gray-500">هیچ وظیفه‌ای وجود ندارد</p>';
      return;
    }
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
    
    // به‌روزرسانی نمودار وضعیت
    const statusChart = document.getElementById('status-chart');
    if (statusChart) {
      const completedPercentage = totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0;
      const pendingPercentage = totalTasks > 0 ? (pendingTasks / totalTasks * 100) : 0;
      
      statusChart.innerHTML = `
        <div class="flex h-6 rounded-full overflow-hidden">
          <div class="bg-green-500" style="width:${completedPercentage}%"></div>
          <div class="bg-blue-500" style="width:${pendingPercentage}%"></div>
        </div>
        <div class="flex justify-between mt-1 text-xs">
          <span>تکمیل شده: ${completedTasks}</span>
          <span>در حال انجام: ${pendingTasks}</span>
        </div>
      `;
    }
    
    // به‌روزرسانی نمودار اولویت
    const priorityChart = document.getElementById('priority-chart');
    if (priorityChart) {
      const highPercentage = totalTasks > 0 ? (highPriorityTasks / totalTasks * 100) : 0;
      const mediumPercentage = totalTasks > 0 ? (mediumPriorityTasks / totalTasks * 100) : 0;
      const lowPercentage = totalTasks > 0 ? (lowPriorityTasks / totalTasks * 100) : 0;
      
      priorityChart.innerHTML = `
        <div class="flex h-6 rounded-full overflow-hidden">
          <div class="bg-red-500" style="width:${highPercentage}%"></div>
          <div class="bg-yellow-500" style="width:${mediumPercentage}%"></div>
          <div class="bg-green-500" style="width:${lowPercentage}%"></div>
        </div>
        <div class="flex justify-between mt-1 text-xs">
          <span>بالا: ${highPriorityTasks}</span>
          <span>متوسط: ${mediumPriorityTasks}</span>
          <span>پایین: ${lowPriorityTasks}</span>
        </div>
      `;
    }
  }
}

export default UI;