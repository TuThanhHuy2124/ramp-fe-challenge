import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"
import { createContext } from "react"

type CheckboxChangedContextType = React.Dispatch<React.SetStateAction<boolean>>;
export const CheckboxChangedContext = createContext<CheckboxChangedContextType>(() => null)

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [changed, setChanged] = useState(false)
  
  const transactions = useMemo(
    () => {
      console.log(paginatedTransactions, transactionsByEmployee)
      return paginatedTransactions?.data ?? transactionsByEmployee ?? null
    },
    [paginatedTransactions, transactionsByEmployee]
  )
  console.log("Transactions:", transactions)

  const loadAllTransactions = useCallback(async () => {
    if(!employees) {
      setIsLoading(true)
      await employeeUtils.fetchAll()
      setIsLoading(false)
    }

    transactionsByEmployeeUtils.invalidateData(changed && paginatedTransactions === null)
    await paginatedTransactionsUtils.fetchAll()
    setChanged(false)
    console.log("loadAll", paginatedTransactions?.data, transactionsByEmployee)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData(changed && transactionsByEmployee === null)
      await transactionsByEmployeeUtils.fetchById(employeeId)
      setChanged(false)
      console.log("loadEmployee", paginatedTransactions?.data, transactionsByEmployee)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            else if (newValue.id === "") {
              await loadAllTransactions()
              return
            }

            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <CheckboxChangedContext.Provider value={setChanged}>
            <Transactions transactions={transactions} />
          </CheckboxChangedContext.Provider>

          {(paginatedTransactions !== null && paginatedTransactions.nextPage !== null) && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
