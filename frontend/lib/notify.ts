import { notifications } from "@mantine/notifications";

export function notifySuccess(message: string) {
  notifications.show({
    title: "Success",
    message,
    color: "green",
  });
}

export function notifyError(message: string) {
  notifications.show({
    title: "Error",
    message,
    color: "red",
  });
}