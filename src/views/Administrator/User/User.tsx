import {
  Badge,
  Button,
  Flex,
  Grid,
  Menu,
  rem,
  TextInput,
  Text,
  Title,
  Center,
  ActionIcon,
  Box,
} from "@mantine/core";
import {
  IconCaretDown,
  IconCheck,
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
// import { HRRepository } from "../../../services/RepositoryBase";
// import { API_ROUTER } from "../../../constants/api/api_router";
import { paginationBase } from "../../../interfaces/PaginationResponseBase";
// import { Users } from "../../../interfaces/User";
import axios from "axios";
import { formatDateTime, getValueById } from "../../../helpers/FunctionHelper";
import { modals } from "@mantine/modals";
import CreateDataView from "./CreateDataView";
import EditDataView from "./EditDataView";
import { notifications } from "@mantine/notifications";

const User = () => {
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
  //select
  const position = [
    { value: "A", label: "Quản lý" },
    { value: "I", label: "Thực tập sinh" },
    { value: "PT", label: "Part-time" },
    { value: "FT", label: "Full-time" },
  ];

  const columns = React.useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Mã nhân viên",
        Cell: ({ renderedCellValue }) => (
          <Badge color="green" variant="dot">
            {renderedCellValue}
          </Badge>
        ),
      },
      {
        accessorKey: "name",
        header: "Tên nhân viên",
      },
      {
        accessorKey: "dateOfBirth",
        header: "Ngày sinh",
        Cell: ({ renderedCellValue }: any) => (
          <Text size="12.5px" fw={"500"}>
            {renderedCellValue && formatDateTime(renderedCellValue)}
          </Text>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "SĐT",
      },
      {
        accessorKey: "identificationCard",
        header: "CCCD",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "address",
        header: "Địa chỉ",
      },
      {
        accessorKey: "typeContract",
        header: "Loại hợp đồng",
        Cell: ({ renderedCellValue }) => (
          <Text fw={500} size="12.5px">
            {getValueById(
              renderedCellValue?.toString() ?? "",
              position,
              "label"
            )}
          </Text>
        ),
      },
      {
        accessorKey: "position",
        header: "Vị trí",
      },
      {
        accessorKey: "action",
        header: "Thao tác",
        Cell: ({ row }) => (
          <Flex justify={"start"} gap={5}>
            <ActionIcon
              variant="light"
              color="yellow"
              onClick={() => modalEdit(row.original.id)}
            >
              <IconEdit size={20} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => modalDelete(row.original.id)}
            >
              <IconTrash size={20} />
            </ActionIcon>
          </Flex>
        ),
        size: 75,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [position]
  );

  const modalCreate = () => {
    modals.openConfirmModal({
      title: <Title order={5}>Thêm nhân viên mới</Title>,
      size: "auto",
      children: <CreateDataView onSubmit={setDeleteViewStatus} />,
      confirmProps: { display: "none" },
      cancelProps: { display: "none" },
    });
  };

  const modalEdit = (id: string) => {
    modals.openConfirmModal({
      title: <Title order={5}>Chỉnh sửa thông tin nhân viên</Title>,
      size: "auto",
      children: <EditDataView onSubmit={setDeleteViewStatus} id={id} />,
      confirmProps: { display: "none" },
      cancelProps: { display: "none" },
    });
  };

  const modalDelete = (id: string) => {
    modals.openConfirmModal({
      title: <Title order={5}>Xóa nhân viên</Title>,
      size: "auto",
      children: (
        <Box mb={-20}>
          <Text fw={500} size="18px" mt={15}>
            Bạn có chắc muốn xóa nhân viên này ?
          </Text>
          <Flex justify={"end"} mt={15}>
            <Button
              leftSection={<IconCheck size={14} />}
              onClick={() => deleteData(id)}
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

  const fetchData = async () => {
    // let url = `${API_ROUTER.GET_LIST_USER}`;

    const getUser = axios.get(`http://localhost:3000/users?_start=0&_end=20`);

    try {
      // const res = new HRRepository<Users>();
      // const dataApi = await res.getLists(url);
      const dataApi = await getUser;
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

  const deleteData = async (id: string) => {
    open();
    const deleteUser = axios.delete(`http://localhost:3000/users/${id}`);

    const dataApi = await deleteUser;
    if (dataApi.status === 200) {
      setDeleteViewStatus((prev: any) => !prev);
      notifications.show({
        color: "green",
        message: "Xóa nhân viên thành công !",
      });
      modals.closeAll();
    }
    close();
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
          <Button
            leftSection={<IconPlus size={"15px"} />}
            onClick={() => modalCreate()}
          >
            Thêm mới
          </Button>
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
        left: ["mrt-row-select", "code"],
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

export default User;
