import {
  Badge,
  Box,
  Button,
  Fieldset,
  Flex,
  Grid,
  Textarea,
} from "@mantine/core";
import { getValueById } from "../../helpers/FunctionHelper";
import { useEffect, useState } from "react";
import { WorkScheduleDetail } from "../../interfaces/WorkSchedule";
import { IconCheck } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

const NoteWorkDay = ({
  dataWD,
  replaceWD,
}: {
  dataWD: any;
  replaceWD: any;
}) => {
  const [dataWDProps, setDataWSProps] = useState<WorkScheduleDetail[]>([]);
  const dataStatus = [
    { label: "Chính thức tại văn phòng", value: "CT" },
    { label: "Từ xa - TT sẵn sàng", value: "TXSS" },
    { label: "Từ xa - TT thấp điểm", value: "TXTD" },
    { label: "Nghỉ", value: "N" },
  ];

  const handleNoteChange = (shift: string, newNote: string) => {
    setDataWSProps((prev) => {
      return prev.map((day) => ({
        ...day,
        workingDayInfo: day.workingDayInfo.map((item) =>
          item.shift === shift ? { ...item, note: newNote } : item
        ),
      }));
    });
  };

  useEffect(() => {
    if (dataWD) {
      setDataWSProps(dataWD);
    }
  }, [dataWD]);

  return (
    <Box pt={10} w={"70vw"} maw={850} mb={-20}>
      <Grid>
        {dataWDProps[0]?.workingDayInfo?.map((item: any) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
            <Fieldset
              legend={
                <Badge color={item.status === "N" ? "red" : "green"}>
                  Ca {item.shift} -{" "}
                  {getValueById(
                    item.status?.toString() ?? "",
                    dataStatus,
                    "label"
                  )}
                </Badge>
              }
            >
              <Textarea
                placeholder="Nhập ghi chú ca làm việc ..."
                value={item?.note}
                onChange={(e) =>
                  handleNoteChange(item.shift, e.currentTarget.value)
                }
              />
            </Fieldset>
          </Grid.Col>
        ))}
      </Grid>
      <Flex mt={10} justify={"end"}>
        <Button
          leftSection={<IconCheck size={14} />}
          color="green"
          onClick={() => {
            replaceWD(dataWDProps);
            modals.closeAll();
          }}
        >
          Lưu
        </Button>
      </Flex>
    </Box>
  );
};

export default NoteWorkDay;
