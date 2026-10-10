'use client';
import { useState, useEffect } from 'react';
import { Search, Download, Users, Mail, Phone, Calendar, MoreVertical, ShieldCheck, Activity } from 'lucide-react';

const mockMembers = [
  { id: 'MBR-001', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '081234567890', joinDate: '2026-08-10', status: 'Active', bookings: 5 },
  { id: 'MBR-002', name: 'Siti Aminah', email: 'siti@yahoo.com', phone: '081298765432', joinDate: '2026-08-15', status: 'Active', bookings: 2 },
  { id: 'MBR-003', name: 'Ahmad Fauzi', email: 'ahmad@outlook.com', phone: '085612345678', joinDate: '2026-09-01', status: 'Inactive', bookings: 0 },
  { id: 'MBR-004', name: 'Rina Wijaya', email: 'rina.w@gmail.com', phone: '081345678912', joinDate: '2026-09-12', status: 'Active', bookings: 12 },
  { id: 'MBR-005', name: 'Kevin Pratama', email: 'kevin.p@gmail.com', phone: '087812349876', joinDate: '2026-09-20', status: 'Active', bookings: 3 },
  { id: 'MBR-006', name: 'Dewi Lestari', email: 'dewi.l@gmail.com', phone: '081123456789', joinDate: '2026-09-25', status: 'Active', bookings: 1 },
  { id: 'MBR-007', name: 'Agus Setiawan', email: 'agus.setiawan@yahoo.com', phone: '082234567890', joinDate: '2026-10-02', status: 'Active', bookings: 4 },
];

export default function MembersData() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    // Attempt to load from localStorage or use mock
    const storedUsers = localStorage.getItem('admin_users_db');
    if (storedUsers) {
      setMembers(JSON.parse(storedUsers));
    } else {
      // Create a mock DB for presentation
      setMembers(mockMembers);
      localStorage.setItem('admin_users_db', JSON.stringify(mockMembers));
    }

    // Also inject the currently logged-in user if they exist and aren't in the list
    const currentUserStr = localStorage.getItem('user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setMembers(prev => {
        if (!prev.find(m => m.email === currentUser.email)) {
          const newMember = {
            id: `MBR-00${prev.length + 1}`,
            name: currentUser.name || 'Current User',
            email: currentUser.email || 'user@example.com',
            phone: currentUser.phone || '08xxxxxxxxxx',
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            bookings: 1
          };
          const updated = [newMember, ...prev];
          localStorage.setItem('admin_users_db', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadCSV = () => {
    const headers = ['ID Member', 'Nama Lengkap', 'Email', 'No. Telepon', 'Tanggal Bergabung', 'Status', 'Total Booking'];
    const csvRows = [headers.join(',')];
    
    filteredMembers.forEach(m => {
      csvRows.push(`${m.id},"${m.name}","${m.email}","${m.phone}","${m.joinDate}",${m.status},${m.bookings}`);
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_member_sewajetski.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Member</h1>
          <p className="text-gray-500 text-sm">Kelola dan pantau seluruh data pelanggan terdaftar.</p>
        </div>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 bg-[var(--royal)] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Total Member</p>
            <h3 className="text-2xl font-bold text-gray-900">{members.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Member Aktif</p>
            <h3 className="text-2xl font-bold text-gray-900">{members.filter(m => m.status === 'Active').length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Total Bookings</p>
            <h3 className="text-2xl font-bold text-gray-900">{members.reduce((acc, curr) => acc + curr.bookings, 0)}</h3>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4 border-b">Member ID</th>
                <th className="p-4 border-b">Nama & Kontak</th>
                <th className="p-4 border-b">Tanggal Bergabung</th>
                <th className="p-4 border-b text-center">Total Booking</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <span className="font-semibold text-gray-900">{member.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600 text-sm">
                          {member.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Mail size={12} /> {member.email}</span>
                          <span className="flex items-center gap-1"><Phone size={12} /> {member.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(member.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'})}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 font-bold w-8 h-8 rounded-full">
                      {member.bookings}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      member.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-900 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">
                    Tidak ada member yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
