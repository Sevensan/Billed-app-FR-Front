/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bill from "../containers/Bills.js"
import store from "../app/Store.js"
import mockStore from "../__mocks__/store"
import userEvent from '@testing-library/user-event'
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe('if I click on New Bill', () => {
      test('Then a new bill page should be open', () => {
        const onNavigate = ( pathname ) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value : localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const newBill = new Bill({ document, onNavigate, store, localStorage: window.localStorage})
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const handleClickNewBill = jest.fn(() => newBill.handleClickNewBill())
        const newBillButton = screen.getByTestId('btn-new-bill')
        newBillButton.addEventListener('click', handleClickNewBill)
        userEvent.click(newBillButton)
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      })
    })
    describe('If I click on eye icon', () => {
      test('Then a modal file should appear', () => {
        // define localstorage
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        // html template
        const html = BillsUI({ data: bills })

        document.body.innerHTML = html
        //navigation
        const onNavigate = ( pathname ) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new Bill({
          document,
          onNavigate,
          store,
          bills,
          localStorage: window.localStorage
        })
        $.fn.modal = jest.fn()
        const eyes = screen.getAllByTestId('icon-eye')
        eyes.forEach(eye => {
          const handleClickIconEye = jest.fn(() => newBill.handleClickIconEye(eye))
          eye.addEventListener('click', handleClickIconEye)
          userEvent.click(eye)
          expect(handleClickIconEye).toHaveBeenCalled()
        })
        expect(screen.getByText('Justificatif')).toBeTruthy()
      })
    })
		describe('Given content is a loading', () => {
			test('Then a loading page should appear', () => {
				const html = BillsUI({ loading: true })
				document.body.innerHTML = html
				expect(screen.getAllByText('Loading...')).toBeTruthy()
			})
		})
		describe('Given an error appends', () => {
			test('Then an error message should appear', () => {
				const html = BillsUI({ error: true })
				document.body.innerHTML = html
				expect(screen.getAllByText('Erreur')).toBeTruthy()
			})
		})
  })
})



// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentPending  = await screen.getByText("En attente (5)")
      expect(contentPending).toBeTruthy()
      const contentRefused  = await screen.getByText("Refusé (1)")
      expect(contentRefused).toBeTruthy()
      expect(screen.getByTestId("icon-eye")).toBeTruthy()
    })
    // describe("When an error occurs on API", () => {
    //   beforeEach(() => {
    //     jest.spyOn(mockStore, "bills")
    //     Object.defineProperty(
    //         window,
    //         'localStorage',
    //         { value: localStorageMock }
    //     )
    //     window.localStorage.setItem('user', JSON.stringify({
    //       type: 'Employee',
    //       email: "employee@test.tld"
    //     }))
    //     const root = document.createElement("div")
    //     root.setAttribute("id", "root")
    //     document.body.appendChild(root)
    //     router()
    //   })
    //   test("fetches bills from an API and fails with 404 message error", async () => {

    //     mockStore.bills.mockImplementationOnce(() => {
    //       return {
    //         list : () =>  {
    //           return Promise.reject(new Error("Erreur 404"))
    //         }
    //       }})
    //     window.onNavigate(ROUTES_PATH.Bills)
    //     await new Promise(process.nextTick);
    //     const message = await screen.getByText(/Erreur 404/)
    //     expect(message).toBeTruthy()
    //   })

    //   test("fetches messages from an API and fails with 500 message error", async () => {

    //     mockStore.bills.mockImplementationOnce(() => {
    //       return {
    //         list : () =>  {
    //           return Promise.reject(new Error("Erreur 500"))
    //         }
    //       }})

    //     window.onNavigate(ROUTES_PATH.Bills)
    //     await new Promise(process.nextTick)
    //     const message = await screen.getByText(/Erreur 500/)
    //     expect(message).toBeTruthy()
    //   })
    // })
  })
})