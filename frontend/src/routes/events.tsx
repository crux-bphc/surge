import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { 
  Plus, Trash2, Pencil, X, Users, UserPlus, Trophy, Mail, CheckCircle, History, RefreshCw, House
} from 'lucide-react';

const emailRegex = /^f\d{8}@hyderabad\.bits-pilani\.ac\.in$/;

interface Group {
  id: string;
  name: string;
  members: string[];
}

interface PastContest {
  contestId: string;
  name: string;
  date: string;
  duration: string;
}

const scrollbar = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full";

export const Route = createFileRoute('/events')({
  component: AdminEventsComponent,
});

function AdminEventsComponent() {
  const [contestId, setContestId] = useState('');
  const [liveContestId, setLiveContestId] = useState('1090');
  const [isContestSaved, setIsContestSaved] = useState(false);
  const [isGlobalSaving, setIsGlobalSaving] = useState(false);

  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Cros', members: ['f20251284@hyderabad.bits-pilani.ac.in', 'f20230008@hyderabad.bits-pilani.ac.in', 'f20250132@hyderabad.bits-pilani.ac.in'] },
    { id: '2', name: 'Fros', members: ['f20251120@hyderabad.bits-pilani.ac.in', 'f20250084@hyderabad.bits-pilani.ac.in', 'f20250044@hyderabad.bits-pilani.ac.in', 'f20241084@hyderabad.bits-pilani.ac.in', 'f20230034@hyderabad.bits-pilani.ac.in'] }
  ]);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentGroupMembers, setCurrentGroupMembers] = useState<string[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string } | null>(null);
  const [contestToDelete, setContestToDelete] = useState<{ contestId: string; name: string } | null>(null);

  const [pastContests, setPastContests] = useState<PastContest[]>([
    { contestId: '1089', name: 'Contest #3', date: '2026-06-01', duration: '2h 00m' },
    { contestId: '1088', name: 'Contest #2', date: '2026-05-25', duration: '2h 00m' },
    { contestId: '1087', name: 'Contest #1', date: '2026-05-18', duration: '2h 30m' },
  ]);

  const handleSaveContest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestId.trim()) return;
    
    setLiveContestId(contestId.trim());
    setIsContestSaved(true);
    
    setPastContests(prev => [
      { 
        contestId: contestId.trim(), 
        name: `Contest #${prev.length + 1}`, 
        date: new Date().toISOString().split('T')[0], 
        duration: '2h 00m' 
      },
      ...prev
    ]);
    
    setContestId('');
    setTimeout(() => setIsContestSaved(false), 3000);
  };

  const handleGlobalSavePortal = () => {
    setIsGlobalSaving(true);
    setTimeout(() => setIsGlobalSaving(false), 2000);
  };

  const handleAddMemberToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const email = currentUserEmail.trim();

    if (email && emailRegex.test(email) && !currentGroupMembers.includes(email)) {
      setCurrentGroupMembers([...currentGroupMembers, email]);
      setCurrentUserEmail('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    if (editingGroupId) {
      setGroups(groups.map(g => g.id === editingGroupId ? { ...g, name: newGroupName.trim(), members: currentGroupMembers } : g));
      setEditingGroupId(null);
    } else {
      setGroups([...groups, { id: Date.now().toString(), name: newGroupName.trim(), members: currentGroupMembers }]);
    }
    
    setNewGroupName('');
    setCurrentGroupMembers([]);
  };

  const handleStartEdit = (group: Group) => {
    setEditingGroupId(group.id);
    setNewGroupName(group.name);
    setCurrentGroupMembers([...group.members]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setNewGroupName('');
    setCurrentGroupMembers([]);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;
    if (editingGroupId === groupToDelete.id) handleCancelEdit();
    setGroups(groups.filter(g => g.id !== groupToDelete.id));
    setGroupToDelete(null);
  };

  const confirmDeleteContest = () => {
    if (!contestToDelete) return;
    setPastContests(pastContests.filter(c => c.contestId !== contestToDelete.contestId));
    setContestToDelete(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 min-h-screen">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500 w-8 h-8" /> 
            Summer of CC — Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Manage weekly contests and organize groups.</p>
        </div>
        <button
          onClick={handleGlobalSavePortal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-colors"
        >
          {isGlobalSaving ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><House className="w-4 h-4" /> Events Dashboard</>}
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          Previous Contests
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/50">
          <table className="w-full text-left border-collapse text-sm">
            <thead> 
              <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Contest ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Actions</th>
                <th className="py-3 px-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-slate-300">
              {pastContests.map((contest, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono font-bold text-white">{contest.contestId}</td>
                  <td className="py-3 px-4">{contest.name}</td>
                  <td className="py-3 px-4">{contest.date}</td>
                  <td className="py-3 px-4 text-slate-400">{contest.duration}</td>
                  <td className="py-3 px-4 text-center">
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-3 rounded flex items-center gap-1.5 text-xs transition-colors mx-auto">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh Leaderboard
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => setContestToDelete({ contestId: contest.contestId, name: contest.name })}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Deploy New Contest</h2>
            <form onSubmit={handleSaveContest} className="space-y-3">
              <input
                type="text"
                placeholder="Contest ID (e.g. 1091)"
                value={contestId}
                onChange={(e) => setContestId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!contestId.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isContestSaved ? <><CheckCircle className="w-4 h-4" /> Live</> : 'Push Contest'}
              </button>           
            </form>
          </div>

          <div className={`bg-slate-800 border rounded-xl p-5 ${editingGroupId ? 'border-amber-500' : 'border-slate-700'}`}>
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingGroupId ? 'Edit Group' : 'Create Group'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />

              <div className="border border-slate-700 rounded-lg p-3 bg-slate-900/50 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Add user email"
                      value={currentUserEmail}
                      onChange={(e) => setCurrentUserEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddMemberToDraft(e);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />              
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMemberToDraft}
                    className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>

                <div className={`space-y-1.5 max-h-36 overflow-y-auto pr-2 ${scrollbar}`}>
                  {currentGroupMembers.map((member, idx) => (
                    <div key={idx} className="flex justify-between bg-slate-800 rounded px-2 py-1 text-xs">
                      <span className="truncate text-slate-300 font-mono">{member}</span>
                      <button type="button" onClick={() => setCurrentGroupMembers(currentGroupMembers.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newGroupName.trim()}
                className={`w-full font-medium py-2 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50 ${editingGroupId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              >
                {editingGroupId ? 'Save Modifications' : 'Create Group'}
              </button>
              
              {editingGroupId && (
                <button type="button" onClick={handleCancelEdit} className="w-full bg-slate-700 hover:bg-slate-600 py-1.5 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-cyan-400 w-5 h-5" /> Groups ({groups.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div key={group.id} className={`bg-slate-800 border rounded-xl p-4 flex flex-col ${editingGroupId === group.id ? 'border-amber-500' : 'border-slate-700'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white truncate">{group.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => handleStartEdit(group)} className="text-slate-400 hover:text-amber-400 p-1">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setGroupToDelete({ id: group.id, name: group.name })} className="text-slate-400 hover:text-rose-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs bg-slate-900 text-slate-300 px-2 py-1 rounded w-fit mb-3">
                  <Users className="w-3 h-3" /> {group.members.length} Members
                </div>

                <div className={`space-y-1 max-h-40 overflow-y-auto pr-2 ${scrollbar}`}>
                  {group.members.map((member, idx) => (
                    <div key={idx} className="text-xs bg-slate-900 rounded px-2 py-1.5 font-mono text-slate-300 truncate">
                      {member}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Delete Group?</h3>
            <p className="text-slate-300 mb-6 text-sm">This will permanently remove "{groupToDelete.name}".</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setGroupToDelete(null)} className="px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeleteGroup} className="px-4 py-2 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {contestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Delete Contest?</h3>
            <p className="text-slate-300 mb-6 text-sm">This will permanently remove "{contestToDelete.name}".</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setContestToDelete(null)} className="px-4 py-2 rounded text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeleteContest} className="px-4 py-2 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
