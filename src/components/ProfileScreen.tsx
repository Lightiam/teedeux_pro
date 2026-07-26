import React, { useState } from 'react';
import { ScreenId } from '../types';
import type { ApiUser } from '../api/types';
import { profileApi } from '../api/endpoints';

interface ProfileScreenProps {
  user: ApiUser;
  onNavigate: (screen: ScreenId) => void;
  onSignOut: () => void;
  onUserUpdated: (user: ApiUser) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigate,
  onSignOut,
  onUserUpdated,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.defaultAddress ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const { user: updated } = await profileApi.update({
        name: name.trim(),
        defaultAddress: address.trim() || null,
      });
      onUserUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your changes');
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setName(user.name);
    setAddress(user.defaultAddress ?? '');
    setError(null);
    setEditing(false);
  };

  return (
    <div className="pb-6 space-y-4">
      {/* Identity */}
      <div className="px-4 pt-3">
        <div className="bg-white rounded-2xl border border-stone-200/70 p-4 flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover bg-stone-100 shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#9c3f00] text-white flex items-center justify-center font-extrabold text-2xl shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-lg text-[#1c1b1b] truncate">{user.name}</h2>
            <p className="text-xs text-[#584238] truncate">{user.email}</p>
            {user.isPlusMember && (
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#ffdbcc] text-[#9c3f00] text-[10px] font-bold">
                Plus member
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Wallet + points */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('payment')}
          className="bg-white rounded-2xl border border-stone-200/70 p-4 text-left active:scale-[0.98] transition-transform"
        >
          <p className="text-xl font-extrabold text-[#9c3f00] tabular-nums">
            ${user.walletBalance.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#584238] mt-0.5">Wallet</p>
        </button>

        <div className="bg-white rounded-2xl border border-stone-200/70 p-4">
          <p className="text-xl font-extrabold text-[#3b6934] tabular-nums">{user.loyaltyPoints}</p>
          <p className="text-[11px] text-[#584238] mt-0.5">Points</p>
        </div>
      </div>

      {/* Details */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-stone-200/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-sm text-[#1c1b1b]">Your details</h3>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs font-bold text-[#9c3f00] active:opacity-60"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={save} className="space-y-3">
              {error && (
                <p className="text-xs text-[#93000a] bg-[#ffdad6] rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="space-y-1.5">
                <label htmlFor="profile-name" className="block text-xs font-bold text-[#584238]">
                  Name
                </label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-[#f6f3f2] border border-stone-200 text-sm outline-none focus:border-[#9c3f00] focus:ring-2 focus:ring-[#9c3f00]/15"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-address"
                  className="block text-xs font-bold text-[#584238]"
                >
                  Delivery address
                </label>
                <input
                  id="profile-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, state"
                  className="w-full h-11 px-4 rounded-2xl bg-[#f6f3f2] border border-stone-200 text-sm outline-none focus:border-[#9c3f00] focus:ring-2 focus:ring-[#9c3f00]/15"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 h-11 rounded-full bg-[#9c3f00] text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {busy ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={cancel}
                  className="px-5 h-11 rounded-full bg-stone-100 text-[#584238] font-bold text-sm active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="space-y-3">
              <Row label="Phone" value={user.phone ?? 'Not set'} />
              <Row label="Delivery address" value={user.defaultAddress ?? 'Not set'} />
            </dl>
          )}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="px-4 space-y-2">
        <NavRow icon="receipt_long" label="Orders" onClick={() => onNavigate('transactions')} />
        <NavRow
          icon="account_balance_wallet"
          label="Payment methods"
          onClick={() => onNavigate('payment')}
        />
        <NavRow
          icon="location_on"
          label="Delivery address"
          onClick={() => onNavigate('location')}
        />
      </div>

      <div className="px-4 pt-2">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full py-3.5 rounded-full bg-white border border-stone-200 text-[#9E2A2B] font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sign out
        </button>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#584238] font-bold">
      {label}
    </dt>
    <dd className="text-sm text-[#1c1b1b] mt-0.5">{value}</dd>
  </div>
);

const NavRow: React.FC<{ icon: string; label: string; onClick: () => void }> = ({
  icon,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-stone-200/70 active:scale-[0.99] transition-transform text-left"
  >
    <span className="material-symbols-outlined text-[#9c3f00] shrink-0">{icon}</span>
    <span className="flex-1 font-semibold text-sm text-[#1c1b1b]">{label}</span>
    <span className="material-symbols-outlined text-stone-400 shrink-0">chevron_right</span>
  </button>
);
