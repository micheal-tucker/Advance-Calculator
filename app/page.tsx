"use client"

import { useState, useEffect, useCallback } from "react"
import { Calculator, History, Moon, Sun, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CalculationHistory {
  id: string
  expression: string
  result: string
  timestamp: Date
}

export default function AdvancedCalculator() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { toast } = useToast()

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculator-history")
    const savedTheme = localStorage.getItem("calculator-theme")

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(parsedHistory)
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    }
  }, [])

  // Save to localStorage when history or theme changes
  useEffect(() => {
    localStorage.setItem("calculator-history", JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem("calculator-theme", isDarkMode ? "dark" : "light")
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const addToHistory = (expression: string, result: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date(),
    }
    setHistory((prev) => [newEntry, ...prev.slice(0, 49)]) // Keep last 50 entries
  }

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? num : display + num)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = Number.parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      if (newValue !== null) {
        const expression = `${currentValue} ${operation} ${inputValue}`
        addToHistory(expression, newValue.toString())
        setDisplay(String(newValue))
        setPreviousValue(newValue)
      }
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string): number | null => {
    try {
      switch (operation) {
        case "+":
          return firstValue + secondValue
        case "-":
          return firstValue - secondValue
        case "×":
          return firstValue * secondValue
        case "÷":
          if (secondValue === 0) {
            toast({
              title: "Error",
              description: "Cannot divide by zero",
              variant: "destructive",
            })
            return null
          }
          return firstValue / secondValue
        case "^":
          return Math.pow(firstValue, secondValue)
        default:
          return secondValue
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid calculation",
        variant: "destructive",
      })
      return null
    }
  }

  const performAdvancedOperation = (func: string) => {
    const inputValue = Number.parseFloat(display)
    let result: number | null = null
    let expression = ""

    try {
      switch (func) {
        case "sqrt":
          if (inputValue < 0) {
            toast({
              title: "Error",
              description: "Cannot calculate square root of negative number",
              variant: "destructive",
            })
            return
          }
          result = Math.sqrt(inputValue)
          expression = `√${inputValue}`
          break
        case "sin":
          result = Math.sin((inputValue * Math.PI) / 180) // Convert to radians
          expression = `sin(${inputValue}°)`
          break
        case "cos":
          result = Math.cos((inputValue * Math.PI) / 180)
          expression = `cos(${inputValue}°)`
          break
        case "tan":
          result = Math.tan((inputValue * Math.PI) / 180)
          expression = `tan(${inputValue}°)`
          break
        case "log":
          if (inputValue <= 0) {
            toast({
              title: "Error",
              description: "Cannot calculate logarithm of non-positive number",
              variant: "destructive",
            })
            return
          }
          result = Math.log10(inputValue)
          expression = `log(${inputValue})`
          break
        case "ln":
          if (inputValue <= 0) {
            toast({
              title: "Error",
              description: "Cannot calculate natural logarithm of non-positive number",
              variant: "destructive",
            })
            return
          }
          result = Math.log(inputValue)
          expression = `ln(${inputValue})`
          break
        case "x²":
          result = Math.pow(inputValue, 2)
          expression = `${inputValue}²`
          break
        case "1/x":
          if (inputValue === 0) {
            toast({
              title: "Error",
              description: "Cannot divide by zero",
              variant: "destructive",
            })
            return
          }
          result = 1 / inputValue
          expression = `1/${inputValue}`
          break
      }

      if (result !== null) {
        // Round to avoid floating point precision issues
        result = Math.round(result * 1e10) / 1e10
        addToHistory(expression, result.toString())
        setDisplay(result.toString())
        setWaitingForOperand(true)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid calculation",
        variant: "destructive",
      })
    }
  }

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(display)
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const clearHistory = () => {
    setHistory([])
    toast({
      title: "History cleared",
      description: "All calculation history has been removed",
    })
  }

  // Keyboard support
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event

      if (key >= "0" && key <= "9") {
        inputNumber(key)
      } else if (key === ".") {
        inputDecimal()
      } else if (key === "+") {
        performOperation("+")
      } else if (key === "-") {
        performOperation("-")
      } else if (key === "*") {
        performOperation("×")
      } else if (key === "/") {
        event.preventDefault()
        performOperation("÷")
      } else if (key === "Enter" || key === "=") {
        performOperation("=")
      } else if (key === "Escape" || key === "c" || key === "C") {
        clear()
      } else if (key === "Backspace") {
        if (display.length > 1) {
          setDisplay(display.slice(0, -1))
        } else {
          setDisplay("0")
        }
      }
    },
    [display, operation, previousValue, waitingForOperand],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          {/* Calculator */}
          <Card className="flex-1 p-6 bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Calculator</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyResult} className="hidden sm:flex">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="lg:hidden">
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Display */}
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="text-right text-3xl font-mono font-bold text-gray-900 dark:text-white break-all">
                {display}
              </div>
            </div>

            {/* Button Grid */}
            <div className="grid grid-cols-5 gap-3">
              {/* Row 1 - Advanced Functions */}
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("sin")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                sin
              </Button>
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("cos")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                cos
              </Button>
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("tan")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                tan
              </Button>
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("log")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                log
              </Button>
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("ln")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                ln
              </Button>

              {/* Row 2 - More Advanced Functions */}
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("sqrt")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                √
              </Button>
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("x²")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                x²
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("^")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                x^y
              </Button>
              <Button
                variant="outline"
                onClick={() => performAdvancedOperation("1/x")}
                className="h-12 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                1/x
              </Button>
              <Button variant="destructive" onClick={clear} className="h-12 font-medium">
                C
              </Button>

              {/* Row 3 */}
              <Button
                variant="outline"
                onClick={() => inputNumber("7")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                7
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber("8")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                8
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber("9")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                9
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("÷")}
                className="h-12 text-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              >
                ÷
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (display.length > 1) {
                    setDisplay(display.slice(0, -1))
                  } else {
                    setDisplay("0")
                  }
                }}
                className="h-12 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                ⌫
              </Button>

              {/* Row 4 */}
              <Button
                variant="outline"
                onClick={() => inputNumber("4")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                4
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber("5")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                5
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber("6")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                6
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("×")}
                className="h-12 text-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              >
                ×
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber("(")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                (
              </Button>

              {/* Row 5 */}
              <Button
                variant="outline"
                onClick={() => inputNumber("1")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                1
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber("2")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                2
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber("3")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                3
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("-")}
                className="h-12 text-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              >
                -
              </Button>
              <Button
                variant="outline"
                onClick={() => inputNumber(")")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                )
              </Button>

              {/* Row 6 */}
              <Button
                variant="outline"
                onClick={() => inputNumber("0")}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 col-span-2"
              >
                0
              </Button>
              <Button
                variant="outline"
                onClick={inputDecimal}
                className="h-12 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                .
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("+")}
                className="h-12 text-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              >
                +
              </Button>
              <Button
                onClick={() => performOperation("=")}
                className="h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                =
              </Button>
            </div>
          </Card>

          {/* History Panel */}
          <Card
            className={`w-full lg:w-80 p-6 bg-white dark:bg-gray-800 shadow-xl ${showHistory }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">History</h2>
              </div>
              <Button variant="outline" size="sm" onClick={clearHistory} disabled={history.length === 0}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No calculations yet</p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setDisplay(entry.result)
                      setWaitingForOperand(true)
                    }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{entry.expression}</div>
                    <div className="font-mono font-bold text-gray-900 dark:text-white">= {entry.result}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Mobile Copy Button */}
        <div className="sm:hidden fixed bottom-4 right-4">
          <Button
            onClick={copyResult}
            className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
