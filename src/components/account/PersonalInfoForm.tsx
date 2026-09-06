import { useState, useEffect } from "react";
import { useUserAuth } from "../../contexts/UserAuthProvider";
import { fetchUserProfile, saveUserProfile } from "../../services/userProfile";

export default function PersonalInfoForm() {
  const { user } = useUserAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);

    void fetchUserProfile(user.uid)
      .then((profile) => {
        if (!active) return;
        if (profile) {
          setFirstName(profile.firstName ?? profile.name?.split(" ")[0] ?? "");
          setLastName(profile.lastName ?? profile.name?.split(" ").slice(1).join(" ") ?? "");
          setPhone(profile.phone ?? "");
        } else {
          const parts = (user.displayName ?? "").split(" ");
          setFirstName(parts[0] ?? "");
          setLastName(parts.slice(1).join(" ") ?? "");
        }
      })
      .catch(() => {
        if (active) {
          const parts = (user.displayName ?? "").split(" ");
          setFirstName(parts[0] ?? "");
          setLastName(parts.slice(1).join(" ") ?? "");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setMessage("");
    setError("");
    setSaving(true);

    try {
      await saveUserProfile(user.uid, { firstName, lastName, phone });
      setMessage("Your personal information has been updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update personal information.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8 space-y-6 animate-pulse">
        <div className="h-4 bg-line/50 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-ivory-warm rounded" />
          <div className="h-12 bg-ivory-warm rounded" />
        </div>
        <div className="h-12 bg-ivory-warm rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">Settings</span>
        <h2 className="font-display text-2xl text-midnight mt-1">Personal Information</h2>
        <p className="font-voice italic text-sm text-midnight/60 mt-1">
          Manage your personal details and contact preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              className="w-full bg-transparent border border-line px-4 py-3.5 font-sans text-sm text-midnight outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Your last name"
              className="w-full bg-transparent border border-line px-4 py-3.5 font-sans text-sm text-midnight outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            readOnly
            disabled
            value={user?.email ?? ""}
            className="w-full bg-ivory-warm/70 border border-line px-4 py-3.5 font-sans text-sm text-midnight/60 cursor-not-allowed"
          />
          <p className="mt-1.5 text-[11px] text-midnight/50 font-voice italic">
            Your email is managed by your authentication account and cannot be changed here.
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0550 12 34 56"
            className="w-full bg-transparent border border-line px-4 py-3.5 font-sans text-sm text-midnight outline-none focus:border-gold transition-colors"
          />
        </div>

        {message && (
          <div role="status" className="p-4 border border-green-800/20 bg-green-50 text-sm text-green-900 font-sans">
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="p-4 border border-red-900/20 bg-red-50 text-sm text-red-900 font-sans">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-midnight text-ivory font-sans text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-midnight-deep transition-colors disabled:opacity-60"
        >
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
