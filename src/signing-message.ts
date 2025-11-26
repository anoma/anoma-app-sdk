export const getSignMessage = (address: string) =>
  `I authorize Anoma Pay to derive my account from address ${address}. \nDo NOT sign this message if the request url is not https://anoma.money`;
