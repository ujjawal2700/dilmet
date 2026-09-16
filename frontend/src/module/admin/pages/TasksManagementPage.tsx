import { useState, useEffect } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { AdminNumberInput } from '../components/AdminNumberInput';
import adminService from '../../../core/services/admin.service';
import type { AdminTask } from '../types/admin.types';

const TASK_TYPES = [
  { value: 'checkin', label: 'Daily Check-In' },
  { value: 'message_distinct_users', label: 'Message N Distinct Users' },
  { value: 'send_gift', label: 'Send a Gift' },
];

const emptyForm = {
  taskKey: '',
  title: '',
  description: '',
  type: 'message_distinct_users',
  targetCount: 1,
  rewardCoins: 10,
  icon: 'task_alt',
  deepLink: '/male/discover',
  isActive: true,
};

export const TasksManagementPage = () => {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [form, setForm] = useState(emptyForm);

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    navigationItems,
    handleNavigationClick,
    isCollapsed,
    toggleCollapse,
  } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.listTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (task: AdminTask) => {
    setEditingTask(task);
    setForm({
      taskKey: task.taskKey,
      title: task.title,
      description: task.description || '',
      type: task.type,
      targetCount: task.targetCount,
      rewardCoins: task.rewardCoins,
      icon: task.icon,
      deepLink: task.deepLink,
      isActive: task.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      if (editingTask) {
        await adminService.updateTask(editingTask._id, {
          title: form.title,
          description: form.description,
          type: form.type,
          targetCount: form.targetCount,
          rewardCoins: form.rewardCoins,
          icon: form.icon,
          deepLink: form.deepLink,
          isActive: form.isActive,
        });
      } else {
        await adminService.createTask(form);
      }
      setIsModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (task: AdminTask) => {
    try {
      await adminService.updateTask(task._id, { isActive: !task.isActive });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, isActive: !t.isActive } : t)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async (task: AdminTask) => {
    if (!window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className={`flex-1 p-4 md:p-6 mt-[57px] transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Daily Tasks</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure the tasks male users complete each day to earn coins. Progress resets every day at 12 AM IST.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              <MaterialSymbol name="add" size={20} />
              Add Task
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
              <MaterialSymbol name="error" className="text-red-500" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto"><MaterialSymbol name="close" size={18} /></button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium">Reward</th>
                    <th className="px-4 py-3 font-medium">Deep Link</th>
                    <th className="px-4 py-3 font-medium">Active</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        No tasks configured yet
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task._id} className="text-gray-900 dark:text-white">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <MaterialSymbol name={task.icon} size={18} className="text-pink-500" />
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{task.taskKey}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {TASK_TYPES.find((t) => t.value === task.type)?.label || task.type}
                        </td>
                        <td className="px-4 py-3">{task.targetCount}</td>
                        <td className="px-4 py-3">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">+{task.rewardCoins} coins</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{task.deepLink}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(task)}
                            className="relative inline-flex items-center cursor-pointer"
                          >
                            <div className={`w-11 h-6 rounded-full transition-colors ${task.isActive ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                              <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all ${task.isActive ? 'translate-x-full border-white' : ''}`} />
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <MaterialSymbol name="edit" size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(task)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <MaterialSymbol name="delete" size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl max-w-lg w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Add Task'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MaterialSymbol name="close" size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {!editingTask && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Task Key <span className="text-gray-400 font-normal">(unique, machine ID)</span>
                    </label>
                    <input
                      type="text"
                      value={form.taskKey}
                      onChange={(e) => setForm({ ...form, taskKey: e.target.value.trim() })}
                      placeholder="e.g. say_hi_10"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Say Hi to 10 Girls"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description shown under the title"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    "Message N Distinct Users" counts distinct people messaged (regular chat or a Hi wave).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Count</label>
                    <AdminNumberInput
                      min={1}
                      value={form.targetCount}
                      onChange={(val) => setForm({ ...form, targetCount: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reward Coins</label>
                    <AdminNumberInput
                      min={0}
                      value={form.rewardCoins}
                      onChange={(val) => setForm({ ...form, rewardCoins: val })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon <span className="text-gray-400 font-normal">(Material Symbol name)</span>
                    </label>
                    <input
                      type="text"
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="task_alt"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deep Link</label>
                    <input
                      type="text"
                      value={form.deepLink}
                      onChange={(e) => setForm({ ...form, deepLink: e.target.value })}
                      placeholder="/male/discover"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active (visible to users)</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !form.title || (!editingTask && !form.taskKey)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
