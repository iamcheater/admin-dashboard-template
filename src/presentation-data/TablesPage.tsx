import { useState } from "react";
import { Dropdown } from "../components/Dropdown";
import {
  CheckCircleIcon,
  CopyIcon,
  EditIcon,
  EditIconSmall,
  TrashIcon,
} from "../components/icons";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { Table, type Column } from "../components/Table";
import { TruncatedText } from "../components/TruncatedText";
import { usePageActionParams } from "../hooks/usePageActionParams";
import { usePageParam } from "../hooks/usePageParam";
import { useSortParams } from "../hooks/useSortParams";
import { format } from "../i18n";
import { formatDateTime } from "../lib/format";
import { notifyInfo } from "../lib/toast";
import {
  SAMPLE_COLUMN_WIDTH,
  SAMPLE_PAGE_SIZE,
  SAMPLE_SORT_BY,
  SAMPLE_STATE_ROW_COUNT,
} from "./constants";
import {
  querySampleRecords,
  SAMPLE_OPTIONS,
  SAMPLE_RECORDS,
  type SampleRecord,
} from "./sample-data";
import { ShowcaseSample, ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.tables;
const code = presentationText.code;

const STATE_ROWS = SAMPLE_RECORDS.slice(0, SAMPLE_STATE_ROW_COUNT);

const announce = (action: string, record: SampleRecord) =>
  notifyInfo(format(copy.done, { action, name: record.name }));

const STATE_COLUMNS: Column<SampleRecord>[] = [
  {
    key: SAMPLE_SORT_BY.NAME,
    header: copy.columns.name,
    render: (record) => record.name,
  },
  {
    key: SAMPLE_SORT_BY.EMAIL,
    header: copy.columns.email,
    render: (record) => record.email,
  },
  {
    key: SAMPLE_SORT_BY.CREATED_AT,
    header: copy.columns.created,
    render: (record) => formatDateTime(record.createdAt),
  },
];

export function TablesPage() {
  const { page } = usePageParam();
  const { searchTerm } = usePageActionParams();
  const { sortBy, sortOrder } = useSortParams(
    SAMPLE_SORT_BY.CREATED_AT,
    Object.values(SAMPLE_SORT_BY),
  );
  const [roles, setRoles] = useState<Record<string, string>>({});

  const { rows, totalPages } = querySampleRecords({
    search: searchTerm,
    sortBy,
    sortOrder,
    page,
    pageSize: SAMPLE_PAGE_SIZE,
  });

  const listColumns: Column<SampleRecord>[] = [
    {
      key: SAMPLE_SORT_BY.NAME,
      width: SAMPLE_COLUMN_WIDTH.NAME,
      header: copy.columns.name,
      sortable: true,
      render: (record) => record.name,
    },
    {
      key: SAMPLE_SORT_BY.EMAIL,
      width: SAMPLE_COLUMN_WIDTH.EMAIL,
      header: copy.columns.email,
      sortable: true,
      render: (record) => record.email,
    },
    {
      key: "role",
      width: SAMPLE_COLUMN_WIDTH.ROLE,
      header: copy.columns.role,
      render: (record) => (
        <Dropdown
          label={copy.columns.role}
          options={SAMPLE_OPTIONS}
          value={roles[record.id] ?? record.role}
          onChange={(next) =>
            setRoles((current) => ({ ...current, [record.id]: next }))
          }
        />
      ),
    },
    {
      key: "note",
      width: SAMPLE_COLUMN_WIDTH.NOTE,
      header: copy.columns.note,
      render: (record) => <TruncatedText value={record.note} />,
    },
    {
      key: SAMPLE_SORT_BY.CREATED_AT,
      width: SAMPLE_COLUMN_WIDTH.CREATED,
      header: copy.columns.created,
      sortable: true,
      render: (record) => formatDateTime(record.createdAt),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={copy.list.title}
        description={copy.list.description}
      >
        <div className="page-stack">
          <PageActions search={{ criteria: copy.list.searchCriteria }} />

          <Table
            columns={listColumns}
            rows={rows}
            getRowKey={(record) => record.id}
            getRowLabel={(record) => record.name}
            defaultSortBy={SAMPLE_SORT_BY.CREATED_AT}
            onRowClick={(record) =>
              notifyInfo(format(copy.list.opened, { name: record.name }))
            }
            emptyMessage={
              searchTerm
                ? format(copy.list.emptyFiltered, { search: searchTerm })
                : copy.list.empty
            }
            menu={{
              label: copy.list.menuLabel,
              items: (record) => [
                {
                  icon: <EditIconSmall />,
                  label: copy.menu.edit,
                  onSelect: () => announce(copy.menu.edit, record),
                },
                {
                  icon: <CopyIcon />,
                  label: copy.menu.copyEmail,
                  onSelect: () => announce(copy.menu.copyEmail, record),
                },
                {
                  icon: <TrashIcon />,
                  label: copy.menu.delete,
                  tone: "danger",
                  onSelect: () => announce(copy.menu.delete, record),
                },
              ],
            }}
          />

          <Pagination totalPages={totalPages} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.actions.title}
        description={copy.actions.description}
      >
        <Table
          columns={STATE_COLUMNS}
          rows={STATE_ROWS}
          getRowKey={(record) => record.id}
          emptyMessage={copy.states.emptyMessage}
          actions={(record) => [
            {
              icon: <EditIcon />,
              label: copy.actions.edit,
              onClick: () => announce(copy.actions.edit, record),
            },
            {
              icon: <CheckCircleIcon />,
              label: copy.actions.approve,
              tone: "accent",
              onClick: () => announce(copy.actions.approve, record),
            },
            {
              icon: <TrashIcon />,
              label: copy.actions.delete,
              tone: "danger",
              onClick: () => announce(copy.actions.delete, record),
            },
            {
              text: copy.actions.resend,
              label: copy.actions.resend,
              onClick: () => announce(copy.actions.resend, record),
            },
            {
              text: copy.actions.locked,
              label: copy.actions.locked,
              disabled: true,
              onClick: () => {},
            },
          ]}
        />
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.states.title}
        description={copy.states.description}
      >
        <div className="page-stack">
          <ShowcaseSample
            code={format(code.flag, { name: "isLoading" })}
            note={copy.states.loading}
          >
            <Table
              columns={STATE_COLUMNS}
              rows={[]}
              getRowKey={(record) => record.id}
              emptyMessage={copy.states.emptyMessage}
              isLoading
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flag, { name: "isLoading" })}
            note={copy.states.refreshing}
          >
            <Table
              columns={STATE_COLUMNS}
              rows={STATE_ROWS}
              getRowKey={(record) => record.id}
              emptyMessage={copy.states.emptyMessage}
              isLoading
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flag, { name: "emptyMessage" })}
            note={copy.states.empty}
          >
            <Table
              columns={STATE_COLUMNS}
              rows={[]}
              getRowKey={(record) => record.id}
              emptyMessage={copy.states.emptyMessage}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flag, { name: "error" })}
            note={copy.states.error}
          >
            <Table
              columns={STATE_COLUMNS}
              rows={[]}
              getRowKey={(record) => record.id}
              emptyMessage={copy.states.emptyMessage}
              error={copy.states.errorMessage}
            />
          </ShowcaseSample>
        </div>
      </ShowcaseSection>
    </div>
  );
}
