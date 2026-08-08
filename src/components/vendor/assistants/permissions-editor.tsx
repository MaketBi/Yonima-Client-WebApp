'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  countActivePermissions,
  PERMISSION_GROUPS,
  type AssistantPermissions,
} from '@/types/vendor';

interface PermissionsEditorProps {
  value: AssistantPermissions;
  onChange: (permissions: AssistantPermissions) => void;
  disabled?: boolean;
  idPrefix: string;
}

/**
 * Éditeur des 8 permissions.
 *
 * ⚠️ Ces flags ne sont pas appliqués par la base : aucune policy RLS ne lit
 * `assistant_users.permissions`. C'est du gating d'interface, pas une
 * frontière de sécurité.
 */
export function PermissionsEditor({
  value,
  onChange,
  disabled = false,
  idPrefix,
}: PermissionsEditorProps) {
  const activeCount = countActivePermissions(value);

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
        Permissions {activeCount}/8
      </p>

      {PERMISSION_GROUPS.map((group) => (
        <fieldset key={group.title} className="space-y-2.5">
          <legend className="text-[13px] font-semibold">{group.title}</legend>

          {group.items.map((item) => {
            const id = `${idPrefix}-${item.key}`;

            return (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Label htmlFor={id} className="text-[14px] font-normal">
                    {item.label}
                  </Label>
                  {item.hint && (
                    <p className="text-[12px] text-ink-muted">{item.hint}</p>
                  )}
                </div>
                <Switch
                  id={id}
                  checked={value[item.key]}
                  onCheckedChange={(next) =>
                    onChange({ ...value, [item.key]: next })
                  }
                  disabled={disabled}
                />
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}
