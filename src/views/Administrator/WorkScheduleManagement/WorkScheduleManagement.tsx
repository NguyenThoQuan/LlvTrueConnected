import {
  Badge,
  Button,
  Flex,
  Grid,
  Menu,
  rem,
  TextInput,
  Text,
  ActionIcon,
} from "@mantine/core";
import {
  IconCaretDown,
  IconDownload,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_RowSelectionState,
  useMantineReactTable,
} from "mantine-react-table";
import React, { useEffect, useState } from "react";
import { paginationBase } from "../../../interfaces/PaginationResponseBase";
import axios from "axios";
import { formatDateTime } from "../../../helpers/FunctionHelper";

const WorkScheduleManagement = () => {
  //data and fetching state
  const headerRef = React.useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [isError, setIsError] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [height, setHeight] = useState(0);
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(paginationBase);
  //table state
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [selectIds, setSelectIds] = useState<string[]>([]);
  const [deleteViewStatus, setDeleteViewStatus] = useState(false);

  const columns = React.useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "nameUser",
        header: "Nhân viên",
        Cell: ({ row }) => (
          <Badge color="#228BE6">
            {row.original.idUser} - {row.original.nameUser}
          </Badge>
        ),
      },
      {
        accessorKey: "monthD",
        header: "Tháng làm việc",
        Cell: ({ renderedCellValue }) => (
          <Text fw={500} size="12.5px">
            Tháng {renderedCellValue}
          </Text>
        ),
      },
      {
        accessorKey: "createDate",
        header: "Ngày tạo",
        Cell: ({ renderedCellValue }: any) => (
          <Text size="12.5px" fw={"500"}>
            {renderedCellValue && formatDateTime(renderedCellValue)}
          </Text>
        ),
      },
      {
        accessorKey: "action",
        header: "Thao tác",
        Cell: ({ row }) => (
          <Flex justify={"start"} gap={5}>
            <ActionIcon variant="light" color="yellow">
              <IconEdit size={20} />
            </ActionIcon>
            <ActionIcon variant="light" color="red">
              <IconTrash size={20} />
            </ActionIcon>
          </Flex>
        ),
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    []
  );

  const fetchData = async () => {
    const getData = axios.get(
      `http://localhost:3000/workSchedule?_start=0&_end=20&monthD=${
        new Date().getMonth() + 1
      }`
    );

    try {
      const dataApi = await getData;
      if (dataApi) {
        const result = dataApi?.data;
        if (result) {
          setData(result);
        } else {
          setData([]);
          setRowCount(0);
        }
        setSelectIds([]);
        table.resetRowSelection();
      }
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    const valuesList = Object.keys(rowSelection);
    setSelectIds(valuesList);
    if (valuesList.length < 1) setSelectIds([]);
    else {
      const valuesList = Object.keys(rowSelection);
      setSelectIds(valuesList);
    }
  }, [rowSelection]);

  useEffect(() => {
    fetchData();
  }, [deleteViewStatus]);

  useEffect(() => {
    const headerHeight = headerRef.current?.offsetHeight || 0;
    const handleResize = () => {
      setHeight(window.innerHeight - (190 + headerHeight));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [height]);

  const table = useMantineReactTable({
    columns,
    data,
    positionToolbarAlertBanner: "bottom",
    renderTopToolbarCustomActions: () => (
      <Flex justify={"space-between"} w={"100%"} wrap={"wrap"}>
        <Flex gap="md" w={"72%"} wrap={"wrap"}>
          <Grid w={"100%"}>
            <Grid.Col span={{ base: 12, md: 6, lg: 2 }}>
              <TextInput placeholder="Nhập từ khóa" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 1 }}>
              <Button leftSection={<IconSearch size={14} />}>Tìm kiếm</Button>
            </Grid.Col>
          </Grid>
        </Flex>
        <Flex gap="md" w={"18%"} justify={"end"}>
          <Button leftSection={<IconPlus size={"15px"} />}>Thêm mới</Button>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                rightSection={
                  <IconCaretDown style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Chức năng
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size={"15px"} />}>
                Export Data
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>
    ),
    renderToolbarInternalActions: () => <></>,
    enableRowSelection: true,
    mantineTopToolbarProps: {
      style: {
        borderBottom: "3px solid rgba(128, 128, 128, 0.5)",
        marginBottom: 5,
      },
    },
    getRowId: (row) => row.id?.toString(),
    initialState: {
      showColumnFilters: false,
      columnPinning: {
        right: ["action"],
      },
      columnVisibility: { id: false },
      density: "xs",
    },
    mantineTableContainerProps: {
      style: { maxHeight: height, minHeight: height },
    },
    enableStickyHeader: true,
    onRowSelectionChange: setRowSelection,
    manualFiltering: false,
    manualPagination: true,
    manualSorting: false,
    rowCount,
    onPaginationChange: setPagination,
    mantineTableBodyCellProps: () => ({
      style: {
        fontWeight: "500",
        fontSize: "12.5px",
        padding: "5px 15px",
      },
    }),
    state: {
      pagination,
      showAlertBanner: isError,
      rowSelection,
    },
    mantineToolbarAlertBannerProps: false
      ? { color: "red", children: "Lỗi tải dữ liệu !" }
      : undefined,
    mantinePaginationProps: {
      showRowsPerPage: true,
      withEdges: true,
      rowsPerPageOptions: ["20", "50", "100"],
    },
    paginationDisplayMode: "pages",
    enableColumnPinning: true,
    mantineTableProps: {
      striped: false,
    },
    columnFilterDisplayMode: "popover",
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: { cursor: "pointer" },
    }),
  });

  return <MantineReactTable table={table} />;
};

export default WorkScheduleManagement;
