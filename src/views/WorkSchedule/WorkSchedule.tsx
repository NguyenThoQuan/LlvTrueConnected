import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Select,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import {
  WorkScheduleDetail,
  WorkSchedules,
} from "../../interfaces/WorkSchedule";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCheck,
  IconClockEdit,
  IconEdit,
  IconLoader,
  IconPencilShare,
  IconRepeat,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { modals } from "@mantine/modals";
import NoteWorkDay from "./NoteWorkDay";
import axios from "axios";
import { notifications } from "@mantine/notifications";

const WorkSchedule = () => {
  const entity = {
    id: Math.floor(Math.random() * 100000).toString(),
    idUser: "1",
    month: new Date()?.toISOString(),
    monthD: (new Date()?.getMonth() + 1)?.toString(),
    createDate: null,
    workSchedule: null,
    approve: null,
    isEdit: false,
  };

  const [visible, { toggle, close, open }] = useDisclosure(false);
  const [isFixed, setIsFixed] = useState(true);

  const dataStatus = [
    { label: "Chính thức tại văn phòng", value: "CT" },
    { label: "Từ xa - TT sẵn sàng", value: "TXSS" },
    { label: "Từ xa - TT thấp điểm", value: "TXTD" },
    { label: "Nghỉ", value: "N" },
  ];

  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleDetail[]>([]);

  const rows = [];
  for (let i = 0; i < weekdays.length; i += 6) {
    rows.push(weekdays.slice(i, i + 6));
  }

  const form = useForm<WorkSchedules>({
    mode: "uncontrolled",
    validateInputOnChange: true,
    initialValues: {
      ...entity,
    },
  });

  const getWeekdaysInMonth = (year: number, month: number) => {
    let days: string[] = [];
    let date = new Date(year, month, 1);

    while (date.getMonth() === month) {
      if (date.getDay() !== 0) {
        days.push(
          new Date(
            new Date(date ?? "").setHours(new Date(date ?? "").getHours() + 7)
          )?.toISOString()
        );
      }
      date.setDate(date.getDate() + 1);
    }

    const firstDate = new Date(days[0]);
    const firstDayOfWeek = firstDate.getDay();

    let daysToAddAtStart = 0;
    if (firstDayOfWeek !== 1) {
      daysToAddAtStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    }

    if (daysToAddAtStart > 0) {
      days = [...Array(daysToAddAtStart).fill(""), ...days];
    }

    const lastDate = new Date(days[days.length - 1]);
    const lastDayOfWeek = lastDate.getDay();

    let daysToAddAtEnd = 0;
    if (lastDayOfWeek !== 6) {
      daysToAddAtEnd = 6 - lastDayOfWeek;
    }

    if (daysToAddAtEnd > 0) {
      days = [...days, ...Array(daysToAddAtEnd).fill("")];
    }

    return days;
  };

  const changeMonth = (value: any) => {
    form.setValues((prev) => ({
      ...prev,
      month: value
        ? new Date(
            new Date(value ?? "").setHours(new Date(value ?? "").getHours() + 7)
          )?.toISOString()
        : null,
      monthD: value
        ? (new Date(value ?? "")?.getMonth() + 1)?.toString()
        : null,
    }));
    setWeekdays(
      getWeekdaysInMonth(
        new Date(value ?? "").getFullYear(),
        new Date(value ?? "").getMonth()
      )
    );
  };

  const handleStatusChange = (
    newStatus: string,
    shift: string,
    workday: any
  ) => {
    setWorkSchedule((prevSchedule) =>
      prevSchedule.map((wd) => {
        if (wd.workday === workday) {
          return {
            ...wd,
            workingDayInfo: wd.workingDayInfo.map((wdi) =>
              wdi.shift === shift ? { ...wdi, status: newStatus } : wdi
            ),
          };
        }
        return wd;
      })
    );
  };

  const updateWorkSchedule = (dataNote: any) => {
    setWorkSchedule((prevSchedule) => {
      return prevSchedule.map((item) =>
        item.workday === dataNote[0].workday ? dataNote[0] : item
      );
    });
  };

  const modalNoteWorkDay = (dataWD: any) => {
    modals.openConfirmModal({
      title: (
        <Title order={5}>
          Ghi chú thứ {new Date(dataWD[0]?.workday).getDay() + 1} ngày{" "}
          {new Date(dataWD[0]?.workday).getDate()} tháng{" "}
          {new Date(dataWD[0]?.workday).getMonth() + 1} năm{" "}
          {new Date(dataWD[0]?.workday).getFullYear()}
        </Title>
      ),
      size: "auto",
      children: <NoteWorkDay dataWD={dataWD} replaceWD={updateWorkSchedule} />,
      confirmProps: { display: "none" },
      cancelProps: { display: "none" },
    });
  };

  const modalConfirm = (value: any) => {
    modals.openConfirmModal({
      title: <Title order={5}>Chú ý !!!</Title>,
      size: "auto",
      children: (
        <Box mb={-20}>
          <Text fw={500} size="18px" mt={15}>
            Bạn chưa lưu lịch làm việc tháng{" "}
            {new Date(form.getValues()?.month ?? "")?.getMonth() + 1}, bạn có
            muốn lưu nó ?
          </Text>
          <Flex justify={"end"} mt={15}>
            <Button
              leftSection={<IconCheck size={14} />}
              color="green"
              onClick={() => {
                createData(form.getValues());
                changeMonth(value);
                setWorkSchedule([]);
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

  const modalRequestEdit = () => {
    modals.openConfirmModal({
      title: <Title order={5}>Yêu cầu chỉnh sửa lịch làm việc !</Title>,
      size: "auto",
      children: (
        <Box mb={-20}>
          <Text fw={500} size="18px" mt={15}>
            Xác nhận gửi yêu cầu chỉnh sửa lịch làm việc tháng{" "}
            {form.getValues()?.monthD} !
          </Text>
          <Flex justify={"end"} mt={15} gap={"md"}>
            <Button
              leftSection={<IconCheck size={14} />}
              color="green"
              onClick={() => {
                handleRequestEdit();
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

  const getDetailData = async () => {
    open();
    const getDetail = axios.get(
      `http://localhost:3000/workSchedule?idUser=1&monthD=${
        form.getValues()?.monthD
      }`
    );

    const dataApi = await getDetail;
    if (dataApi && dataApi?.data?.length > 0) {
      const result = dataApi?.data;
      setWorkSchedule(result[0]?.workSchedule);
      form.setValues(result[0]);
    } else {
      setWorkSchedule([]);
      form.setValues((prev) => ({
        ...prev,
        id: Math.floor(Math.random() * 100000).toString(),
        idUser: "1",
        createDate: null,
        workSchedule: null,
        approve: null,
        isEdit: false,
      }));
    }
  };

  const createData = async (dataSubmit: WorkSchedules) => {
    open();
    const createUser = axios.post("http://localhost:3000/workSchedule", {
      ...dataSubmit,
      createDate: new Date().toISOString(),
      workSchedule: workSchedule,
      approve: 2,
    });
    const dataApi = await createUser;
    if (dataApi) {
      notifications.show({
        color: "green",
        message: "Đã lưu lịch làm việc, vui lòng chờ quản lý xét duyệt !",
      });
      modals.closeAll();
    }
    close();
  };

  const handleRequestEdit = async () => {
    open();
    const requestEdit = axios.patch(
      `http://localhost:3000/workSchedule/${form.getValues()?.id}`,
      {
        isEdit: true,
      }
    );
    const dataApi = await requestEdit;
    if (dataApi) {
      notifications.show({
        color: "green",
        message:
          "Gửi yêu cầu chỉnh sửa lịch làm việc thành công, vui lòng chờ quản lý phê duyệt !",
      });
      getDetailData();
      modals.closeAll();
    }
    close();
  };

  useEffect(() => {
    const today = new Date();
    setWeekdays(getWeekdaysInMonth(today.getFullYear(), today.getMonth()));
  }, []);

  useEffect(() => {
    getDetailData();
  }, [form.getValues()?.monthD]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
      setIsFixed(!scrolledToBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Table striped highlightOnHover withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th colSpan={6} ta={"center"} bg={"#228BE6"}>
              <Flex justify={"space-between"} align={"center"}>
                <Text fw={"bold"} size="10.5px" c={"white"}>
                  <IconUser size={10.5} color="white" /> Tên User
                </Text>
                <Text fw={500} size="18px" m={"5px 10px"} c={"white"}>
                  Lịch đăng ký làm việc T
                  {new Date(form.getValues()?.month ?? "")?.getMonth() + 1}/
                  {new Date(form.getValues()?.month ?? "")?.getFullYear()}
                </Text>
                <MonthPickerInput
                  rightSection={<IconRepeat size={10.5} color="white" />}
                  locale="vi"
                  valueFormat="TMM/YYYY"
                  c={"white"}
                  value={
                    form.getValues()?.month
                      ? new Date(form.getValues()?.month ?? "")
                      : null
                  }
                  onChange={(e) => {
                    if (
                      workSchedule.length > 0 &&
                      form.getValues()?.approve !== false
                    ) {
                      modalConfirm(e);
                    } else {
                      changeMonth(e);
                    }
                  }}
                  size="xs"
                  variant="unstyled"
                />
              </Flex>
            </Table.Th>
          </Table.Tr>
          <Table.Tr>
            <Table.Th ta={"center"}>Thứ 2</Table.Th>
            <Table.Th ta={"center"}>Thứ 3</Table.Th>
            <Table.Th ta={"center"}>Thứ 4</Table.Th>
            <Table.Th ta={"center"}>Thứ 5</Table.Th>
            <Table.Th ta={"center"}>Thứ 6</Table.Th>
            <Table.Th ta={"center"}>Thứ 7</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows?.map((items, row) => (
            <Table.Tr key={row}>
              {items?.map((item, col) => (
                <Table.Td key={col} ta={"center"} w={250}>
                  <Flex
                    justify={"space-between"}
                    align={"center"}
                    style={
                      item !== ""
                        ? {
                            borderBottom: "1px solid #DEE2E6",
                            paddingBottom: "7.5px",
                          }
                        : {}
                    }
                  >
                    <Text fw={700} size="12.5px">
                      {item === "" ? (
                        ""
                      ) : (
                        <Badge
                          color={
                            workSchedule?.some((i) => i.workday === item)
                              ? "green"
                              : "red"
                          }
                        >
                          {new Date(item)?.getDate()}/
                          {new Date(item)?.getMonth() + 1}/
                          {new Date(item)?.getFullYear()}
                        </Badge>
                      )}
                    </Text>
                    {item === "" ? (
                      <></>
                    ) : (
                      <Checkbox
                        checked={workSchedule?.some((i) => i.workday === item)}
                        disabled={form.getValues()?.approve !== null}
                        onClick={() =>
                          setWorkSchedule((prev) =>
                            prev.some((i) => i.workday === item)
                              ? prev.filter((i) => i.workday !== item)
                              : [
                                  ...prev,
                                  {
                                    workday: item,
                                    workingDayInfo: [
                                      { shift: "1", status: "CT", note: "" },
                                      { shift: "2", status: "CT", note: "" },
                                      { shift: "3", status: "CT", note: "" },
                                      { shift: "4", status: "CT", note: "" },
                                    ],
                                  },
                                ]
                          )
                        }
                      />
                    )}
                  </Flex>
                  {workSchedule?.some((i) => i.workday === item) ? (
                    <>
                      {workSchedule
                        ?.filter(
                          (wd) => wd.workday?.toString() === item?.toString()
                        )[0]
                        ?.workingDayInfo?.map((wdi) => (
                          <Flex gap={"md"} align={"center"} m={"2.5px 0px"}>
                            <Badge
                              color={wdi.status === "N" ? "red" : "green"}
                              w={60}
                            >
                              Ca {wdi.shift}
                            </Badge>
                            <Select
                              data={dataStatus}
                              value={wdi.status}
                              size="xs"
                              onChange={(e) =>
                                handleStatusChange(
                                  e?.toString() ?? "",
                                  wdi.shift?.toString() ?? "",
                                  item
                                )
                              }
                              readOnly={form.getValues()?.approve !== null}
                            />
                          </Flex>
                        ))}
                      <Button
                        leftSection={<IconEdit size={14} />}
                        size="xs"
                        w={"70%"}
                        disabled={form.getValues()?.approve !== null}
                        onClick={() =>
                          modalNoteWorkDay(
                            workSchedule?.filter(
                              (wd) =>
                                wd.workday?.toString() === item?.toString()
                            )
                          )
                        }
                      >
                        Ghi chú ngày làm việc
                      </Button>
                    </>
                  ) : item === "" ? (
                    <></>
                  ) : (
                    <Flex h={162.5} align={"center"} justify={"center"}>
                      <Text fw={700} size="12.5px">
                        Nghỉ
                      </Text>
                    </Flex>
                  )}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {form.getValues()?.approve === null ? (
        <Button
          pos={isFixed ? "fixed" : "static"}
          leftSection={<IconCheck size={18} />}
          style={{ bottom: 10, right: 10 }}
          variant="filled"
          color="green"
          onClick={() => createData(form.getValues())}
          disabled={workSchedule.length === 0}
        >
          Lưu lịch làm việc
        </Button>
      ) : form.getValues()?.approve === false ? (
        <Flex
          pos={"fixed"}
          justify={"end"}
          gap={"md"}
          style={{ bottom: 10, right: 10 }}
        >
          {form.getValues()?.isEdit === false ? (
            <Button
              leftSection={<IconPencilShare size={18} />}
              variant="filled"
              color="#228BE6"
              onClick={() => modalRequestEdit()}
            >
              Yêu cầu chỉnh sửa
            </Button>
          ) : (
            <Button
              leftSection={<IconLoader size={18} />}
              variant="filled"
              color="yellow"
            >
              Đã gửi yêu cầu chỉnh sửa vui lòng chờ quản lý phê duyệt !
            </Button>
          )}
          <Button
            leftSection={<IconClockEdit size={18} />}
            variant="filled"
            color="yellow"
            style={{ cursor: "none" }}
          >
            Vui lòng chờ quản lý phê duyệt lịch làm việc !
          </Button>
        </Flex>
      ) : (
        <Flex
          pos={"fixed"}
          justify={"end"}
          gap={"md"}
          style={{ bottom: 10, right: 10 }}
        >
          {form.getValues()?.isEdit === false ? (
            <Button
              leftSection={<IconPencilShare size={18} />}
              variant="filled"
              color="#228BE6"
              onClick={() => modalRequestEdit()}
            >
              Yêu cầu chỉnh sửa
            </Button>
          ) : (
            <Button
              leftSection={<IconLoader size={18} />}
              variant="filled"
              color="yellow"
            >
              Đã gửi yêu cầu chỉnh sửa vui lòng chờ quản lý phê duyệt !
            </Button>
          )}
          <Button
            leftSection={<IconCheck size={18} />}
            variant="filled"
            color="green"
            style={{ cursor: "none" }}
          >
            Lịch làm việc đã được duyệt !
          </Button>
        </Flex>
      )}
    </>
  );
};

export default WorkSchedule;
