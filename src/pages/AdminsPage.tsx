import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FIELD_LIMITS } from "../api/constants";
import {
  ADMIN_ROLES,
  ADMIN_ROLE_LABELS,
  ADMINS_SORT_BY,
  type AdminRole,
  type AdminUserDto,
} from "../api/types";
import { Dropdown } from "../components/Dropdown";
import { Modal } from "../components/Modal";
import { MODAL_SIZE } from "../components/constants";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { Table, type Column } from "../components/Table";
import { TrashIcon } from "../components/icons";
import { Button, Field, PasswordField, TextField } from "../components/ui";
import { usePageActionParams } from "../hooks/usePageActionParams";
import { usePageParam } from "../hooks/usePageParam";
import { useSortParams } from "../hooks/useSortParams";
import { format, text } from "../i18n";
import { FIRST_PAGE, REGEX_PATTERN } from "../lib/constants";
import { formatDateTime } from "../lib/format";
import {
  describeNewPasswordProblem,
  passwordComplexityHint,
} from "../lib/password";
import { notifyFailure, notifySuccess } from "../lib/toast";
import {
  deleteAdmin,
  inviteAdmin,
  listAdmins,
  updateAdminRole,
} from "../redux/actions/admins";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  ADMINS_COLUMN_WIDTH,
  ADMINS_DEFAULT_SORT_BY,
  ADMINS_PAGE_SIZE,
  ADMIN_DIALOG,
  type AdminDialog,
} from "./constants";

interface InviteForm {
  email: string;
  fullName: string;
  password: string;
  role: AdminRole;
}

const ADMIN_ROLE_OPTIONS = ADMIN_ROLES.map((role) => ({
  value: role,
  label: ADMIN_ROLE_LABELS[role],
}));

const SUPER_ADMIN_ROLE_VALUE = "SUPER_ADMIN";
const SUPER_ADMIN_ROLE_OPTIONS = [
  { value: SUPER_ADMIN_ROLE_VALUE, label: text.common.superAdmin },
];

export function AdminsPage() {
  const dispatch = useAppDispatch();
  const admins = useAppSelector((state) => state.adminsReducer.admins);
  const meta = useAppSelector((state) => state.adminsReducer.meta);
  const listError = useAppSelector((state) => state.adminsReducer.listError);
  const isListLoading = useAppSelector(
    (state) => state.adminsReducer.listLoading,
  );
  const isInviting = useAppSelector(
    (state) => state.adminsReducer.inviteLoading,
  );
  const isDeleting = useAppSelector(
    (state) => state.adminsReducer.deleteLoading,
  );
  const isUpdatingRole = useAppSelector(
    (state) => state.adminsReducer.updateRoleLoading,
  );

  const { page, setPage } = usePageParam();
  const { searchTerm } = usePageActionParams();
  const { sortBy, sortOrder } = useSortParams(
    ADMINS_DEFAULT_SORT_BY,
    Object.values(ADMINS_SORT_BY),
  );

  const [reloadCount, setReloadCount] = useState(0);
  const [dialog, setDialog] = useState<AdminDialog | null>(null);
  const [target, setTarget] = useState<AdminUserDto | null>(null);
  const [pendingRole, setPendingRole] = useState<{
    admin: AdminUserDto;
    role: AdminRole;
  } | null>(null);

  const inviteForm = useForm<InviteForm>({
    mode: "onTouched",
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      role: ADMIN_ROLES[0],
    },
  });
  const {
    errors: inviteErrors,
    touchedFields: inviteTouched,
    isValid: isInviteValid,
  } = inviteForm.formState;
  const inviteRole = useWatch({
    control: inviteForm.control,
    name: "role",
    defaultValue: ADMIN_ROLES[0],
  });

  useEffect(() => {
    const promise = dispatch(
      listAdmins({
        page,
        limit: ADMINS_PAGE_SIZE,
        search: searchTerm,
        sortBy,
        sortOrder,
      }),
    );

    return () => promise.abort();
  }, [dispatch, page, searchTerm, sortBy, sortOrder, reloadCount]);

  const closeDialog = () => {
    setDialog(null);
    setTarget(null);
    setPendingRole(null);
  };

  const reload = () => setReloadCount((count) => count + 1);

  const openInvite = () => {
    inviteForm.reset();
    setDialog(ADMIN_DIALOG.INVITE);
  };

  const openDelete = (admin: AdminUserDto) => {
    setTarget(admin);
    setDialog(ADMIN_DIALOG.DELETE);
  };

  const openChangeRole = (admin: AdminUserDto, role: AdminRole) => {
    if (role === admin.adminRole) return;
    setPendingRole({ admin, role });
    setDialog(ADMIN_DIALOG.CHANGE_ROLE);
  };

  const onInvite = async ({ email, fullName, password, role }: InviteForm) => {
    try {
      await dispatch(
        inviteAdmin({
          email,
          password,
          fullName: fullName || undefined,
          role,
        }),
      ).unwrap();
      notifySuccess(format(text.admins.invite.done, { email }));
      closeDialog();
      if (page > FIRST_PAGE) setPage(FIRST_PAGE);
      else reload();
    } catch (error) {
      notifyFailure(error, text.admins.invite.failed);
    }
  };

  const onConfirmChangeRole = async () => {
    if (!pendingRole) return;

    const { admin, role } = pendingRole;
    const name = admin.fullName ?? admin.email;

    try {
      await dispatch(updateAdminRole({ id: admin.id, role })).unwrap();
      notifySuccess(
        format(text.admins.changeRole.done, {
          name,
          role: ADMIN_ROLE_LABELS[role],
        }),
      );
      closeDialog();
      reload();
    } catch (error) {
      notifyFailure(error, text.admins.changeRole.failed);
    }
  };

  const onDelete = async () => {
    if (!target) return;

    const name = target.fullName ?? target.email;

    try {
      await dispatch(deleteAdmin(target.id)).unwrap();
      notifySuccess(format(text.admins.remove.done, { name }));
      closeDialog();
      if (admins.length === 1 && page > FIRST_PAGE) setPage(page - 1);
      else reload();
    } catch (error) {
      notifyFailure(error, text.admins.remove.failed);
    }
  };

  const columns: Column<AdminUserDto>[] = [
    {
      key: ADMINS_SORT_BY.FULL_NAME,
      width: ADMINS_COLUMN_WIDTH.NAME,
      header: text.admins.columns.name,
      sortable: true,
      render: (admin) => admin.fullName ?? text.common.empty,
    },
    {
      key: ADMINS_SORT_BY.EMAIL,
      width: ADMINS_COLUMN_WIDTH.EMAIL,
      header: text.admins.columns.email,
      sortable: true,
      render: (admin) => admin.email,
    },
    {
      key: "role",
      width: ADMINS_COLUMN_WIDTH.ROLE,
      header: text.admins.columns.role,
      render: (admin) =>
        admin.isSuperAdmin ? (
          <Dropdown
            label={text.admins.columns.role}
            options={SUPER_ADMIN_ROLE_OPTIONS}
            value={SUPER_ADMIN_ROLE_VALUE}
            disabled
            onChange={() => {}}
          />
        ) : (
          <Dropdown
            label={text.admins.columns.role}
            options={ADMIN_ROLE_OPTIONS}
            value={admin.adminRole}
            onChange={(next) => openChangeRole(admin, next as AdminRole)}
          />
        ),
    },
    {
      key: ADMINS_SORT_BY.CREATED_AT,
      width: ADMINS_COLUMN_WIDTH.CREATED,
      header: text.admins.columns.created,
      sortable: true,
      render: (admin) => formatDateTime(admin.createdAt),
    },
  ];


  return (
    <div className="page-stack">
      <PageHeader
        title={text.admins.title}
        subtitle={text.admins.description}
        actions={
          <Button variant="primary" onClick={openInvite}>
            {text.admins.newAdmin}
          </Button>
        }
      />

      <PageActions search={{ criteria: text.admins.searchCriteria }} />

      <Table
        columns={columns}
        rows={admins}
        getRowKey={(admin) => admin.id}
        defaultSortBy={ADMINS_DEFAULT_SORT_BY}
        isLoading={isListLoading}
        error={listError}
        emptyMessage={
          searchTerm
            ? format(text.admins.emptyFiltered, { search: searchTerm })
            : text.admins.empty
        }
        actions={(admin) =>
          admin.isSuperAdmin
            ? []
            : [
                {
                  icon: <TrashIcon />,
                  label: text.admins.delete,
                  tone: "danger",
                  onClick: () => openDelete(admin),
                },
              ]
        }
      />

      <Pagination totalPages={meta?.totalPages ?? 0} />

      {dialog === ADMIN_DIALOG.INVITE && (
        <Modal
          size={MODAL_SIZE.WIDE}
          title={text.admins.invite.title}
          onClose={closeDialog}
        >
          <form
            className="modal-form"
            onSubmit={inviteForm.handleSubmit(onInvite)}
            noValidate
          >
            <div className="modal-form__body">
              <div className="modal-form__grid">
                <TextField
                  id="invite-email"
                  required
                  label={text.admins.invite.email}
                  type="email"
                  error={
                    inviteTouched.email
                      ? inviteErrors.email?.message
                      : undefined
                  }
                  autoComplete="off"
                  autoFocus
                  {...inviteForm.register("email", {
                    required: text.validation.required,
                    pattern: {
                      value: REGEX_PATTERN.EMAIL,
                      message: text.validation.email,
                    },
                    setValueAs: (value: string) => value.trim(),
                  })}
                />

                <TextField
                  id="invite-full-name"
                  label={text.admins.invite.fullName}
                  error={
                    inviteTouched.fullName
                      ? inviteErrors.fullName?.message
                      : undefined
                  }
                  maxLength={FIELD_LIMITS.fullNameMax}
                  {...inviteForm.register("fullName", {
                    setValueAs: (value: string) => value.trim(),
                  })}
                />

                <Field label={text.admins.invite.role} hint={text.admins.invite.roleHint}>
                  <Dropdown
                    label={text.admins.invite.role}
                    options={ADMIN_ROLE_OPTIONS}
                    value={inviteRole}
                    onChange={(next) =>
                      inviteForm.setValue("role", next as AdminRole, {
                        shouldDirty: true,
                      })
                    }
                  />
                </Field>

                <PasswordField
                  id="invite-password"
                  required
                  label={text.admins.invite.password}
                  hint={passwordComplexityHint()}
                  error={
                    inviteTouched.password
                      ? inviteErrors.password?.message
                      : undefined
                  }
                  autoComplete="new-password"
                  maxLength={FIELD_LIMITS.passwordMax}
                  {...inviteForm.register("password", {
                    required: text.validation.required,
                    validate: (value) =>
                      describeNewPasswordProblem(value) ?? true,
                  })}
                />
              </div>
            </div>

            <div className="modal-form__footer">
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isInviting}
              >
                {text.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isInviting || !isInviteValid}
              >
                {isInviting ? text.common.creating : text.admins.invite.submit}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {dialog === ADMIN_DIALOG.DELETE && target && (
        <Modal
          icon={<TrashIcon />}
          tone="danger"
          title={text.admins.remove.title}
          description={format(text.admins.remove.description, {
            name: target.fullName ?? target.email,
          })}
          onClose={closeDialog}
        >
          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isDeleting}
            >
              {text.common.cancel}
            </Button>
            <Button
              variant="danger-solid"
              onClick={() => void onDelete()}
              disabled={isDeleting}
            >
              {text.admins.remove.submit}
            </Button>
          </div>
        </Modal>
      )}

      {dialog === ADMIN_DIALOG.CHANGE_ROLE && pendingRole && (
        <Modal
          title={text.admins.changeRole.title}
          description={format(text.admins.changeRole.description, {
            name: pendingRole.admin.fullName ?? pendingRole.admin.email,
            role: ADMIN_ROLE_LABELS[pendingRole.role],
          })}
          onClose={closeDialog}
        >
          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isUpdatingRole}
            >
              {text.common.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => void onConfirmChangeRole()}
              disabled={isUpdatingRole}
            >
              {text.admins.changeRole.submit}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
