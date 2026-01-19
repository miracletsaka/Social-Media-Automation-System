"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Eye, EyeOff, Copy, Check } from "lucide-react"
import { changePassword } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("sk-proj-abc123def456ghi789jkl")
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedApiKey, setCopiedApiKey] = useState(false)
  const [settings, setSettings] = useState({
    autoApprove: false,
    enableNotifications: true,
    maxContentLength: 2000,
    defaultLanguage: "English",
    apiEndpoint: "https://api.neuroflow.ai/v1",
  })

  const [pw, setPw] = useState({
  current: "",
  next: "",
  confirm: "",
});
const [showPw, setShowPw] = useState({
  current: false,
  next: false,
  confirm: false,
});
const [pwMsg, setPwMsg] = useState<string | null>(null);
const [pwLoading, setPwLoading] = useState(false);


  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopiedApiKey(true)
    setTimeout(() => setCopiedApiKey(false), 2000)
  }

  const handleSaveSettings = () => {
    console.log("Settings saved:", settings)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage system configuration and preferences</p>
      </div>

      {/* API Configuration */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">API Configuration</h2>

        <div className="space-y-6">
          {/* API Endpoint */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">API Endpoint</label>
            <input
              type="text"
              value={settings.apiEndpoint}
              onChange={(e) => handleSettingChange("apiEndpoint", e.target.value)}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-2">The base URL for API requests</p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">API Key</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleCopyApiKey}>
                {copiedApiKey ? <Check size={18} /> : <Copy size={18} />}
                {copiedApiKey ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Keep this secret and never share it publicly</p>
          </div>
        </div>
      </Card>

      {/* Content Settings */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Content Settings</h2>

        <div className="space-y-6">
          {/* Max Content Length */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Max Content Length (characters)</label>
            <input
              type="number"
              value={settings.maxContentLength}
              onChange={(e) => handleSettingChange("maxContentLength", Number.parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-2">Maximum allowed characters for generated content</p>
          </div>

          {/* Default Language */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Default Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => handleSettingChange("defaultLanguage", e.target.value)}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Italian</option>
            </select>
          </div>

          {/* Auto Approve */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Approve Content</p>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically approve content meeting quality threshold
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApprove}
                onChange={(e) => handleSettingChange("autoApprove", e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Notifications</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Notifications</p>
              <p className="text-xs text-muted-foreground mt-1">Receive alerts for approvals and system events</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleSettingChange("enableNotifications", e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Security</h2>

        <div className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPw.current ? "text" : "password"}
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPw.next ? "text" : "password"}
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw.next ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Tip: use at least 8 characters.</p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPw.confirm ? "text" : "password"}
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Re-type new password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="gap-2"
              disabled={pwLoading}
              onClick={async () => {
                setPwMsg(null);

                const current = pw.current.trim();
                const next = pw.next.trim();
                const confirm = pw.confirm.trim();

                if (!current || !next || !confirm) {
                  setPwMsg("❌ Please fill all password fields.");
                  return;
                }
                if (next.length < 8) {
                  setPwMsg("❌ New password must be at least 8 characters.");
                  return;
                }
                if (next !== confirm) {
                  setPwMsg("❌ New password and confirmation do not match.");
                  return;
                }

                try {
                  setPwLoading(true);
                  await changePassword({ current_password: current, new_password: next });
                  setPw({ current: "", next: "", confirm: "" });
                  setPwMsg("✅ Password changed successfully.");
                } catch (e: any) {
                  setPwMsg(`❌ ${e.message}`);
                } finally {
                  setPwLoading(false);
                }
              }}
            >
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
              Update Password
            </Button>

            {pwMsg && <div className="text-xs font-bold text-gray-500">{pwMsg}</div>}
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save size={20} />
          Save Settings
        </Button>
        <Button variant="outline" className="bg-transparent">
          Reset to Default
        </Button>
      </div>
    </div>
  )
}
