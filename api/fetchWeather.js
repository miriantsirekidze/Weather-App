import axios from "axios";
import {API_KEY} from '@env'

const forecast = params => `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${params.city}&days=7&aqi=no&alerts=no`
const location = params => `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${params.city}`

const apiCall = async (endpoint) => {
  const options = {
    method: 'GET',
    url: endpoint
  }
  try {
    const response = await axios.request(options)
    return response.data

  }catch (err) {
    console.log(err)
    return null
  }
}

export const fetchForecast = params => {
  let forecastUrl = forecast(params)
  return apiCall(forecastUrl)
}

export const fetchLocation = params => {
  let locationUrl = location(params)
  return apiCall(locationUrl)
}

