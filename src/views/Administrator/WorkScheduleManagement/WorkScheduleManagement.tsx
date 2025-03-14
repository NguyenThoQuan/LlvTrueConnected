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
  Tooltip,
  Title,
  Box,
} from "@mantine/core";
import {
  IconCaretDown,
  IconCheck,
  IconChecklist,
  IconDownload,
  IconEye,
  IconPencilCheck,
  IconPlus,
  IconSearch,
  IconX,
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
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

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
        accessorKey: "approve",
        header: "Trạng thái",
        Cell: ({ row, renderedCellValue }) => (
          <Badge
            color={
              row.original.isEdit !== true
                ? renderedCellValue === "2"
                  ? "green"
                  : "yellow"
                : "orange"
            }
          >
            {row.original.isEdit !== true
              ? renderedCellValue === "2"
                ? "Đã duyệt"
                : "Chờ duyệt"
              : "Yêu cầu chỉnh sửa"}
          </Badge>
        ),
      },
      {
        accessorKey: "action",
        header: "Thao tác",
        Cell: ({ row }) => (
          <Flex justify={"start"} gap={5}>
            <Tooltip label="Xem chi tiết">
              <ActionIcon variant="light" color="blue">
                <IconEye size={20} />
              </ActionIcon>
            </Tooltip>
            {row.original.isEdit === true ? (
              <Tooltip label="Duyệt yêu cầu chỉnh sửa">
                <Menu>
                  <Menu.Target>
                    <ActionIcon variant="light" color="yellow">
                      <IconPencilCheck size={20} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconCheck size={14} />}
                      onClick={() =>
                        modalConfirmRequestEdit(
                          true,
                          row.original.approve,
                          row.original.id
                        )
                      }
                    >
                      Duyệt yêu cầu
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconX size={14} />}
                      onClick={() =>
                        modalConfirmRequestEdit(
                          false,
                          row.original.approve,
                          row.original.id
                        )
                      }
                    >
                      Từ chối yêu cầu
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Tooltip>
            ) : row.original.approve !== "2" &&
              row.original.isEdit === false ? (
              <Tooltip label="Duyệt lịch làm việc">
                <ActionIcon variant="light" color="green">
                  <IconChecklist size={20} />
                </ActionIcon>
              </Tooltip>
            ) : (
              <></>
            )}
          </Flex>
        ),
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 10,
      },
    ],
    []
  );

  const fetchData = async () => {
    const getData = axios.get(
      `http://localhost:3000/workSchedule?_start=0&_end=20&monthD=${
        new Date().getMonth() + 1
      }&approve_ne=0`
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

  const handleRequestEdit = async (
    confirm: boolean,
    approve: boolean,
    id: any
  ) => {
    open();
    const requestEdit = axios.patch(
      `http://localhost:3000/workSchedule/${id}`,
      {
        approve: confirm === true ? "0" : approve,
        isEdit: false,
      }
    );
    const dataApi = await requestEdit;
    if (dataApi) {
      notifications.show({
        color: "green",
        message: "Xác nhận yêu cầu chỉnh sửa !",
      });
      fetchData();
      modals.closeAll();
    }
    close();
  };

  const modalConfirmRequestEdit = (
    confirm: boolean,
    approve: boolean,
    id: any
  ) => {
    modals.openConfirmModal({
      title: <Title order={5}>Duyệt yêu cầu chỉnh sửa lịch làm việc !!!</Title>,
      size: "auto",
      children: (
        <Box mb={-20}>
          <Text fw={500} size="18px" mt={15}>
            Xác nhận {confirm === true ? "duyệt" : "từ chối"} yêu cầu chỉnh sửa
            ?
          </Text>
          <Flex justify={"end"} mt={15}>
            <Button
              leftSection={<IconCheck size={14} />}
              color="green"
              onClick={() => {
                handleRequestEdit(confirm, approve, id);
                modals.closeAll();
              }}
            >
              Xác nhận
            </Button>
          </Flex>
        </Box>
      ),
      confirmProps: { display: "none" },
      cancelProps: { display: "none" },
    });
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
