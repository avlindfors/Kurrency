import React, { Component } from 'react';
import './App.css';
import 'currency-flags/dist/currency-flags.css'
import {
  FaExchangeAlt,
  FaBars,
  FaPlus,
  FaUndoAlt,
  FaSearch,
} from 'react-icons/fa'

import api from './api'
import utils from './utils/common'
import currencies_data from './data/currencies'
import Currency from './Currency'

function Header({ isLoading }) {
  return (
    <header className={isLoading ? "header-container hidden" : "header-container"}>
      <h1 className="header-logo">
        Kurrency
        </h1>
    </header>
  )
}

function Content(props) {
  const { isLoading, toCurrency, fromCurrency } = props
  return (
    <section className={isLoading ? "content-container hidden" : "content-container"}>
      <div className="inner-container">
        <div className="input-container">
          <input
            className="currency-input"
            spellCheck="false"
            placeholder="0"
            name="from-value"
            onChange={props.handleValueChange}
            value={props.fromValue}
          />
          <button className="currency-button" name="from-currency" onClick={props.changeCurrency}>
            <span className="currency-button-text">
              {fromCurrency ? fromCurrency.symbol : "USD"}
            </span>
            <span className="currency-button-icon-container" >
              <FaBars className="currency-button-icon" />
            </span>
          </button>
        </div>

        <div className="change-currency-container">
          <span className="change-icon-container" onClick={props.swapCurrencies}>
            <FaExchangeAlt className="change-icon" />
          </span>
        </div>

        <div className="input-container">
          <input
            className="currency-input"
            spellCheck="false"
            placeholder="0"
            name="to-value"
            onChange={props.handleValueChange}
            value={props.toValue}
          />
          <button className="currency-button" name="to-currency" onClick={props.changeCurrency}>
            <span className="currency-button-text">
              {toCurrency ? toCurrency.symbol : "USD"}
            </span>
            <span className="currency-button-icon-container">
              <FaBars className="currency-button-icon" />
            </span>
          </button>
        </div>
        <div className="result-info-container">
          <p className="result-info">
            1 {fromCurrency ? fromCurrency.symbol : "USD"} is {fromCurrency ? utils.truncateValue(fromCurrency.exchange(1, toCurrency), 8) : "0"} {toCurrency ? toCurrency.symbol : "SEK"}
          </p>
        </div>
        <div className="reset-container">
          <button className="reset-button" onClick={props.resetFields}>
            <span className="reset-text">Reset</span>
            <span className="reset-icon-container">
              <FaUndoAlt className="reset-icon" />
            </span>
          </button>
        </div>
      </div>

    </section>
  )
}

class Loader extends Component {
  render() {
    const { isLoading } = this.props
    return (
      <div className={isLoading ? "loader-container" : "loader-container hidden"}>
        <span className="loader-logo-container">
          <h1 className="header-logo">Kurrency</h1>
          <p className="loader-slogan">Your online currency converter</p>
        </span>

        <div className="loader-and-title-container">
          <div className="loader" />
          <h1 className="loader-title">loading exchange rates...</h1>
        </div>
      </div>
    )
  }
}

class Footer extends Component {
  render() {
    const { isLoading } = this.props
    return (
      <footer className={isLoading ? "footer hidden" : "footer"}>
        <div className="inner-footer">
          <p> View the source code on <a href="https://www.github.com/alindfor/Kurrency/" target="_blank" rel="noopener noreferrer">GitHub</a></p>
          <p>Made with ReactJS by <a href="https://github.com/alindfor/" target="_blank" rel="noreferrer noopener">Alexander Lindfors</a>, 2019</p>
          <p>The currency exchange rates are fetched using <a href="https://exchangeratesapi.io/" target="_blank" rel="noreferrer noopener">Exchange Rates API</a></p>
        </div>
      </footer>
    )
  }
}

class Modal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      filter: "",
      unfilteredCurrencies: this.props.currencies,
      filteredCurrencies: this.props.currencies
    }
  }

  _handleKeyDown = (event) => {
    var ESCAPE_KEY = 27;
    if (this.props.isShowing) {
      switch (event.keyCode) {
        case ESCAPE_KEY:
          this.closeModal()
          break;
        default:
          break;
      }
    }
  }
  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown)
  }

  componentWillReceiveProps(newProps, oldProps) {

    //Attempt to make sure we have the currencies after initial load
    if (oldProps.currencies !== newProps.currencies) {
      this.setState({
        unfilteredCurrencies: newProps.currencies,
        filteredCurrencies: newProps.currencies
      })
    }
  }
  filterCurrencies = () => {

    const { unfilteredCurrencies, filter } = this.state

    if (filter.length === 0) {
      //Reset the filter
      this.setState({
        filteredCurrencies: unfilteredCurrencies
      })
    } else {
      //Filter the list on the search text)
      let updatedFilter = unfilteredCurrencies.filter((currency) => {
        let containsFilter = currency.contains(filter)
        return containsFilter
      })
      this.setState({
        filteredCurrencies: updatedFilter
      })
    }
  }
  updateText = (event) => {

    if (this.props.isShowing) {
      this.setState({
        filter: event.target.value
      }, () => {
        this.filterCurrencies()
      })
    }
  }

  closeModal = (data) => {
    this.setState({
      filter: ""
    })
    const { filteredCurrencies } = this.state
    let returnData = undefined
    if (typeof data !== 'undefined') {
      returnData = filteredCurrencies[data]
    }
    this.props.onClose(returnData)
    this.currenciesList.scrollTo({ top: 0, left: 0 })
  }

  render() {

    const { isShowing } = this.props
    const { filter, filteredCurrencies } = this.state
    if (isShowing) {
      this.currencySearchField.focus()
    }
    return (
      <div className={isShowing ? "modal-container" : "modal-container hidden"}>
        <div className="modal">
          <div className="close-modal-container">
            <FaPlus className="close-modal-icon" onClick={() => this.closeModal()} />
          </div>
          <div className="currency-search-container">
            <FaSearch className="currency-search-icon" />
            <input
              ref={(ref) => this.currencySearchField = ref}
              className="currency-search"
              autoCorrect="false"
              type="text"
              placeholder="Enter a currency or a country.."
              value={filter}
              onChange={this.updateText}
            ></input>
          </div>
          <div className="currencies-container" ref={(ref) => this.currenciesList = ref}>
            <ul className="currencies-list">
              {filteredCurrencies.map((item, index) => {
                return (
                  <li key={index} className="currency-item" onClick={() => this.closeModal(index)}>
                    <div className={`currency-flag currency-flag-xl currency-flag-${item.symbol.toLowerCase()}`}></div>
                    <div>
                      <p className="currency-list-symbol">{item.symbol}</p>
                      <p className="currency-list-name">{item.name}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}
class Kurrency extends Component {


  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      modalIsOpen: false,
      currencies: [],
      waitingForNewCurrency: -1,
      toCurrency: undefined,
      toValue: "0",
      fromCurrency: undefined,
      fromValue: "0"
    }
  }

  componentDidMount() {

    api.getRates()
      .then((response) => {
        this.buildExchangeRates(response)
        this.setLoading(false)
      }).catch((response) => {
        console.log("The fetching of rates failed")
        console.log("response: ", response)
        this.setLoading(false)
      })
  }

  render() {
    const {
      isLoading,
      modalIsOpen,
      currencies,
      fromCurrency,
      fromValue,
      toCurrency,
      toValue } = this.state
    return (
      <div className="container">

        <Header isLoading={isLoading}></Header>
        <Content
          isLoading={isLoading}
          fromCurrency={fromCurrency}
          fromValue={fromValue}
          toCurrency={toCurrency}
          toValue={toValue}
          handleValueChange={this.handleValueChange}
          changeCurrency={this.openModal}
          swapCurrencies={this.swapCurrencies}
          resetFields={this.resetFields}>
        </Content>
        <Modal
          onClose={this.closeModal}
          isShowing={modalIsOpen}
          currencies={currencies}>
        </Modal>
        <Loader isLoading={isLoading}></Loader>

        <Footer isLoading={isLoading} />

      </div>
    )
  }

  resetFields = () => {
    const { currencies } = this.state
    this.setState({
      fromCurrency: currencies[0],
      toCurrency: currencies[1],
      fromValue: "",
      toValue: ""
    })
  }
  handleValueChange = (event) => {
    const { toCurrency, fromCurrency } = this.state
    const { name, value } = event.target
    const { data } = event.nativeEvent
    if (data !== " " && (data >= 0 || data <= 9 || data === "," || data === ".")) {
      let replaceComma = value.replace(",", ".")
      switch (name) {
        case "from-value":
          this.setState({
            fromValue: replaceComma,
            toValue: utils.truncateValue(fromCurrency.exchange(replaceComma, toCurrency), 3)
          })
          break;
        case "to-value":
          this.setState({
            toValue: replaceComma,
            fromValue: utils.truncateValue(toCurrency.exchange(replaceComma, fromCurrency), 3)
          })
          break;
        default:
          console.log("Default, unused case. There was no matching field name.")
      }
    }
  }
  setLoading = (state) => {
    this.setState({
      isLoading: state,
    })
  }

  buildExchangeRates = (rates) => {
    let ratesArray = Object.entries(rates)
    var currencies = []
    ratesArray.forEach((currency) => {
      let symbol = currency[0]
      let rate = currency[1]
      let currencyData = currencies_data[symbol]
      let country = currencyData.country
      let currencyName = currencyData.currency
      let newCurrency = new Currency(symbol, currencyName, rate, country)
      currencies.push(newCurrency)
    })

    //We need to add EUR, the base currency, manually
    let baseCurrency = new Currency("EUR", "Euro", 1, "Europe")
    currencies.push(baseCurrency)
    this.setState({
      currencies: currencies,
      fromCurrency: currencies[0],
      toCurrency: currencies[1]
    })
  }

  openModal = (data, changeCallback) => {

    let requestingField = data.target.name
    let requestingFieldIndex = -1
    switch (requestingField) {
      case "from-currency":
        requestingFieldIndex = 0
        break;
      case "to-currency":
        requestingFieldIndex = 1
        break;
      default:
        console.log("Default, unused case")
        break;
    }
    this.setState({
      modalIsOpen: true,
      waitingForNewCurrency: requestingFieldIndex
    })
  }

  swapCurrencies = () => {
    const {
      toCurrency,
      toValue,
      fromCurrency,
      fromValue } = this.state
    this.setState({
      toCurrency: fromCurrency,
      fromCurrency: toCurrency,
      toValue: fromValue,
      fromValue: toValue
    })
  }

  closeModal = (newCurrency) => {
    const {
      waitingForNewCurrency,
      toValue,
      fromValue,
      toCurrency,
      fromCurrency
    } = this.state

    //Check that we get a declared var that is not undefined
    if (waitingForNewCurrency === -1) {
      console.log("Unknown receiver of selected currency")
      return
    }

    if (typeof newCurrency !== 'undefined') {
      switch (waitingForNewCurrency) {
        //Updated the 'from currency'
        case 0:
          this.setState({
            fromCurrency: newCurrency,
            fromValue: utils.truncateValue(toCurrency.exchange(toValue, newCurrency))
          })
          break;
        //Updated the 'to currency'
        case 1:
          this.setState({
            toCurrency: newCurrency,
            toValue: utils.truncateValue(fromCurrency.exchange(fromValue, newCurrency), 3)
          })
          break;
        default:
          console.log("Default, unused case. There is no correlating currency field.")
          break;
      }
    }
    this.setState({
      modalIsOpen: false,
      waitingForNewCurrency: -1
    })
  }
}

export default Kurrency;
