const userAccount = {
  name: "Kieron",
  id: 0
}
const pie = {
  type: "Apple"
}
const purchaseOrder = {
  owner: userAccount,
  item: pie
}
console.log('1', purchaseOrder.item.type)

const allOrders = [purchaseOrder]

const firstOrder = allOrders[0]
console.log('2', firstOrder.item.type)

const poppedFirstOrder = allOrders.pop()

type PurchaseOrder = typeof purchaseOrder

const readonlyOrders: readonly PurchaseOrder[] = [purchaseOrder]

const test:[string, number] = ['test', 35];