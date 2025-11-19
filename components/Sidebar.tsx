
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { PlusIcon, LogoutIcon, BotIcon, SidebarIcon } from './icons';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  onNewChat: () => void;
  onCloseSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, onNewChat, onCloseSidebar }) => {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-center">
          <BotIcon className="w-8 h-8 text-indigo-400 mr-3" />
          <h1 className="text-l font-bold">Chorah Labs ARI</h1>
        </div>

        {/* Collapse button */}
        <button
          onClick={onCloseSidebar}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <SidebarIcon className="w-5 h-5 text-gray-300" />
        </button>
      </div>
  
      <button 
        onClick={onNewChat}
        className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-6"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Recent
        </h2>
        <ul className="space-y-2">
          {conversations.map(conv => (
            <li key={conv.id}>
              <a href={`#/chat/${conv.id}`} className="block text-sm text-gray-300 hover:bg-gray-700 p-2 rounded-md truncate">
                {conv.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full text-left text-sm text-gray-300 hover:bg-gray-700 p-2 rounded-md transition-colors"
        >
          <LogoutIcon className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;