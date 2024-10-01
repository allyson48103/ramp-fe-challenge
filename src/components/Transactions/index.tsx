import { useState, useCallback, useEffect } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()
  const [updatedTransactions, setUpdatedTransactions] = useState(transactions)

  // Update the local state when the transactions prop changes
  useEffect(() => {
    setUpdatedTransactions(transactions)
  }, [transactions])

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      // Update the transaction in the state after approval
      setUpdatedTransactions((prevTransactions) => {
        if (!prevTransactions) {
          return prevTransactions // If prevTransactions is null, just return it (no update needed)
        }

        return prevTransactions.map((transaction) =>
          transaction.id === transactionId ? { ...transaction, approved: newValue } : transaction
        )
      })
    },
    [fetchWithoutCache]
  )

  if (updatedTransactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {updatedTransactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
