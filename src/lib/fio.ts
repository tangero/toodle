interface FioTransaction {
  transactionId: string;
  date: string;
  amount: number;
  variableSymbol: string | null;
  comment: string | null;
}

interface FioResponse {
  accountStatement: {
    transactionList: {
      transaction: Array<{
        column22?: { value: string };  // transactionId
        column0?: { value: string };   // date
        column1?: { value: number };   // amount
        column5?: { value: string };   // vs
        column25?: { value: string };  // comment
      }>;
    };
  };
}

export async function fetchNewTransactions(fioToken: string): Promise<FioTransaction[]> {
  const url = `https://www.fio.cz/ib_api/rest/last/${fioToken}/transactions.json`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`FIO API error: ${res.status}`);
  }

  const data = (await res.json()) as FioResponse;
  const txList = data?.accountStatement?.transactionList?.transaction ?? [];

  return txList
    .filter((tx) => tx.column1?.value && tx.column1.value > 0)  // only credits
    .map((tx) => ({
      transactionId: String(tx.column22?.value ?? ''),
      date: tx.column0?.value ?? new Date().toISOString(),
      amount: Math.round(tx.column1?.value ?? 0),
      variableSymbol: tx.column5?.value?.trim() || null,
      comment: tx.column25?.value ?? null,
    }));
}
