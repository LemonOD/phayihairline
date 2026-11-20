"use client"

import { StatusSelect } from "./status-select"
import { setBookingStatus, setOrderStatus } from "@/lib/actions/admin"
import type { BookingStatus, OrderStatus } from "@/types"

const ORDER: readonly OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
const BOOKING: readonly BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"]

export const OrderStatusSelect = ({ id, value }: { id: string; value: OrderStatus }) =>
  <StatusSelect id={id} value={value} options={ORDER} action={setOrderStatus} />

export const BookingStatusSelect = ({ id, value }: { id: string; value: BookingStatus }) =>
  <StatusSelect id={id} value={value} options={BOOKING} action={setBookingStatus} />
