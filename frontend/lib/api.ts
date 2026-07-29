const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse(response: Response, fallbackMessage: string): Promise<void> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || fallbackMessage);
  }
}

// ---------- Stations ----------
export type Station = {
  stationId: number;
  stationName: string | null;
};

export async function getStations(): Promise<Station[]> {
  const response = await fetch(`${BASE_URL}/stations`);
  return response.json();
}

export async function createStation(stationName: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/stations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationName }),
  });
  await handleResponse(response, "Failed to create station");
}

export async function updateStation(id: number, stationName: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/stations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationName }),
  });
  await handleResponse(response, "Failed to update station");
}

export async function deleteStation(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/stations/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Failed to delete station");
}

// ---------- Order Types ----------
export type OrderType = {
  orderTypeId: number;
  orderType: string | null;
};

export async function getOrderType(): Promise<OrderType[]> {
  const response = await fetch(`${BASE_URL}/order-types`);
  return response.json();
}

export async function createOrderType(orderType: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/order-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderType }),
  });
  await handleResponse(response, "Failed to create order type");
}

export async function updateOrderType(id: number, orderType: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/order-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderType }),
  });
  await handleResponse(response, "Failed to update order type");
}

export async function deleteOrderType(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/order-types/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Failed to delete order type");
}

// ---------- USSD ----------
export type Ussd = {
  ussdId: number;
  ussdCode: string | null;
};

export async function getUssd(): Promise<Ussd[]> {
  const response = await fetch(`${BASE_URL}/ussd`);
  return response.json();
}

export async function createUssd(ussdCode: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/ussd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ussdCode }),
  });
  await handleResponse(response, "Failed to create USSD code");
}

export async function updateUssd(id: number, ussdCode: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/ussd/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ussdCode }),
  });
  await handleResponse(response, "Failed to update USSD code");
}

export async function deleteUssd(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/ussd/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Failed to delete USSD code");
}

// ---------- Presenters ----------
export type Presenter = {
  presenterId: number;
  presenterName: string | null;
  stationId: number | null;
};

export async function getPresenters(): Promise<Presenter[]> {
  const response = await fetch(`${BASE_URL}/presenters`);
  return response.json();
}

export async function createPresenter(presenterName: string, stationId: number | null): Promise<void> {
  const response = await fetch(`${BASE_URL}/presenters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presenterName, stationId }),
  });
  await handleResponse(response, "Failed to create presenter");
}

export async function updatePresenter(
  id: number,
  presenterName: string,
  stationId: number | null
): Promise<void> {
  const response = await fetch(`${BASE_URL}/presenters/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presenterName, stationId }),
  });
  await handleResponse(response, "Failed to update presenter");
}

export async function deletePresenter(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/presenters/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Failed to delete presenter");
}

// ---------- Order Log ----------
export type OrderLog = {
  orderId: number;
  stationId: number | null;
  orderTypeId: number | null;
  amount: string | null;
  duration: number | null;
  startDate: string | null;
  endDate: string | null;
  dailyOrderAmount: string | null;
};

export type OrderLogForm = {
  stationId: number;
  orderTypeId: number;
  amount: string;
  duration: number;
  startDate: string;
  endDate: string;
  dailyOrderAmount: string;
};

export async function getOrderLogs(): Promise<OrderLog[]> {
  const response = await fetch(`${BASE_URL}/orders`);
  return response.json();
}

export async function createOrderLog(form: OrderLogForm): Promise<void> {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  await handleResponse(response, "Failed to create order");
}

export async function updateOrderLog(id: number, form: OrderLogForm): Promise<void> {
  const response = await fetch(`${BASE_URL}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  await handleResponse(response, "Failed to update order");
}

export async function deleteOrderLog(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/orders/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Failed to delete order");
}

// ---------- Presenter Expense ----------
export type PresenterExpense = {
  expenseId: number;
  presenterId: number | null;
  amount: string | null;
  paymentDate: string | null;
};

export type PresenterExpenseForm = {
  presenterId: number | null;
  amount: string;
  paymentDate: string;
};

export async function getPresenterExpenses(): Promise<PresenterExpense[]> {
  const response = await fetch(`${BASE_URL}/presenter-expenses`);
  return response.json();
}

export async function createPresenterExpense(form: PresenterExpenseForm): Promise<void> {
  const response = await fetch(`${BASE_URL}/presenter-expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  await handleResponse(response, "Failed to create presenter expense");
}

export async function updatePresenterExpense(id: number, form: PresenterExpenseForm): Promise<void> {
  const response = await fetch(`${BASE_URL}/presenter-expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  await handleResponse(response, "Failed to update presenter expense");
}

export async function deletePresenterExpense(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/presenter-expenses/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Failed to delete presenter expense");
}

// ---------- Daily Log ----------
export type DailyLog = {
  logId: number;
  ussdId: number | null;
  presenterId: number | null;
  earnings: string | null;
  winnerPayment: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
};

export type DailyLogForm = {
  ussdId: number | null;
  presenterId: number | null;
  earnings: string;
  winnerPayment: string;
  date: string;
  startTime: string;
  endTime: string;
};

export async function getDailyLogs(): Promise<DailyLog[]> {
  const response = await fetch(`${BASE_URL}/daily-logs`);
  return response.json();
}

export async function createDailyLog(form: DailyLogForm): Promise<void> {
  const response = await fetch(`${BASE_URL}/daily-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  await handleResponse(response, "Failed to create daily log");
}

export async function updateDailyLog(id: number, form: DailyLogForm): Promise<void> {
  const response = await fetch(`${BASE_URL}/daily-logs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  await handleResponse(response, "Failed to update daily log");
}

export async function deleteDailyLog(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/daily-logs/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response, "Failed to delete daily log");
}