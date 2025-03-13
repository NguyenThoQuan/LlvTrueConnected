import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Select,
  TextInput,
} from "@mantine/core";
import { Users } from "../../../interfaces/User";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import { IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";

const EditDataView = ({ onSubmit, id }: { onSubmit: any; id: any }) => {
  const entity = {
    id: Math.floor(Math.random() * 100000).toString(),
    code: null,
    name: null,
    dateOfBirth: null,
    phoneNumber: null,
    identificationCard: null,
    email: null,
    address: null,
    typeContract: null,
    position: null,
  };

  const [visible, { toggle, close, open }] = useDisclosure(false);

  const form = useForm<Users>({
    mode: "uncontrolled",
    validateInputOnChange: true,
    initialValues: {
      ...entity,
    },

    transformValues: (values) => ({
      ...values,
      dateOfBirth: new Date(
        new Date(values.dateOfBirth ?? "").setHours(
          new Date(values.dateOfBirth ?? "").getHours() + 7
        )
      )?.toISOString(),
    }),

    validate: {
      code: (value: string | null) => {
        if (!value) {
          return "Vui lòng nhập mã nhân viên !";
        }
      },
      name: (value: string | null) => {
        if (!value) {
          return "Vui lòng nhập tên nhân viên !";
        }

        if (value && value?.trim().length < 3) {
          return "Tên nhân viên không hợp lệ !";
        }
      },
      dateOfBirth: (value: string | null) => {
        if (!value) {
          return "Vui lòng nhập ngày sinh !";
        }
      },
      identificationCard: (value: string | null) => {
        if (!value) {
          return "Vui lòng nhập số CCCD !";
        }

        if (value && value?.trim().length !== 12) {
          return "Số CCCD không hợp lệ !";
        }
      },
      typeContract: (value: string | null) => {
        if (!value) {
          return "Vui lòng chọn loại hợp đồng !";
        }
      },
      position: (value: string | null) => {
        if (!value) {
          return "Vui lòng chọn vị trí làm việc !";
        }
      },
    },
  });

  const getDetail = async () => {
    const getUser = axios.get(`http://localhost:3000/users?id=${id}`);

    try {
      const dataApi = await getUser;
      if (dataApi) {
        const result = dataApi?.data;
        if (result) {
          form.setValues(result[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const editData = async (dataSubmit: Users) => {
    open();
    const editUser = axios.put(`http://localhost:3000/users/${id}`, dataSubmit);
    const dataApi = await editUser;
    if (dataApi) {
      onSubmit((prev: any) => !prev);
      notifications.show({
        color: "green",
        message: "Chỉnh sửa nhân viên thành công !",
      });
      modals.closeAll();
    }
    close();
  };

  useEffect(() => {
    if (id) {
      getDetail();
    }
  }, [id]);

  return (
    <Box
      component="form"
      pt={10}
      w={"50vw"}
      maw={500}
      onSubmit={form.onSubmit((e: Users) => {
        editData(e);
      })}
    >
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <TextInput
            label="Mã nhân viên"
            placeholder="Nhập mã nhân viên"
            {...form.getInputProps("code")}
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <TextInput
            label="Tên nhân viên"
            placeholder="Nhập tên nhân viên"
            {...form.getInputProps("name")}
            withAsterisk
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <DatePickerInput
            label="Ngày sinh"
            placeholder="Nhập ngày sinh"
            valueFormat="DD/MM/YYYY"
            maxDate={new Date()}
            value={
              form.getValues()?.dateOfBirth
                ? new Date(form.getValues()?.dateOfBirth ?? "")
                : null
            }
            {...form.getInputProps("dateOfBirth")}
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <TextInput
            label="SĐT"
            placeholder="SĐT"
            {...form.getInputProps("phoneNumber")}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <TextInput
            label="CCCD"
            placeholder="CCCD"
            {...form.getInputProps("identificationCard")}
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <TextInput
            label="Email"
            placeholder="Email"
            {...form.getInputProps("email")}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={12}>
          <TextInput
            label="Địa chỉ"
            placeholder="Địa chỉ"
            {...form.getInputProps("address")}
          />
        </Grid.Col>
      </Grid>
      <Divider mt={10} label="Thông tin làm việc" labelPosition="center" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Select
            label="Loại hợp đồng"
            placeholder="Chọn loại hợp đồng"
            data={[
              { value: "A", label: "Quản lý" },
              { value: "I", label: "Thực tập sinh" },
              { value: "PT", label: "Part-time" },
              { value: "FT", label: "Full-time" },
            ]}
            value={form.getValues()?.typeContract}
            searchable
            nothingFoundMessage="Không tìm thấy dữ liệu !"
            {...form.getInputProps("typeContract")}
            onChange={(e) =>
              form.setValues((prev) => ({ ...prev, typeContract: e }))
            }
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Select
            label="Vị trí"
            placeholder="Chọn vị trí"
            data={[
              { value: "FE", label: "FE" },
              { value: "BE", label: "BE" },
              { value: "DevOps", label: "DevOps" },
              { value: "BA", label: "BA" },
              { value: "Tester", label: "Tester" },
              { value: "UI/UX", label: "UI/UX" },
            ]}
            value={form.getValues()?.position}
            searchable
            nothingFoundMessage="Không tìm thấy dữ liệu !"
            {...form.getInputProps("position")}
            onChange={(e) =>
              form.setValues((prev) => ({ ...prev, position: e }))
            }
            withAsterisk
          />
        </Grid.Col>
      </Grid>
      <Flex justify={"end"} gap={"md"} mt={10}>
        <Button
          color="teal"
          leftSection={<IconCheck size={14} />}
          type="submit"
        >
          Lưu
        </Button>
      </Flex>
    </Box>
  );
};

export default EditDataView;
