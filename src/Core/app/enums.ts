export enum ERoleType {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

export enum ECategoryType {
  STARTER = "STARTER",
  MAIN = "MAIN",
  DESSERT = "DESSERT",
  DRINK = "DRINK",
}

export enum EOrderStatusType {
  PENDING = "PENDING", // İstifadəçi sifarişi göndərib, lakin hələ qəbul olunmayıb
  ACCEPTED = "ACCEPTED", // Staff sifarişi təsdiq edib
  PREPARING = "PREPARING", // Sifariş hazırlanır
  PAID = "PAID", // Ödəniş uğurla həyata keçirilib
  CANCELLED = "CANCELLED", // Sifariş ləğv edilib
}

export enum EReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECT = "REJECT",
}

export enum EPaymentMethod {
  ONLINE = "online",
  CASH = "cash",
  CARD = "card",
  APPLE_PAY = "apple_pay",
  GOOGLE_PAY = "google_pay",
}
