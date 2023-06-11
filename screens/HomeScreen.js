import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { debounce } from "lodash";

import { theme } from "../theme";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { MapPinIcon, CalendarDaysIcon } from "react-native-heroicons/solid";
import { fetchForecast, fetchLocation } from "../api/fetchWeather";
import { weatherImages } from "../constants";
import {storeData, getData} from '../utils/asyncStorage'

const HomeScreen = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setShowSearch(false);
    setLocations([]);
    setLoading(true)
    fetchForecast({
      city: loc.name,
    }).then((data) => {
      setWeather(data);
      setLoading(false)
      storeData('city', loc.name)
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocation({ city: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city')
    let city = 'Tbilisi'
    if (myCity) city = myCity
    fetchForecast({
      city,
    }).then((data) => {
      setWeather(data);
      setLoading(false)
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  const { current, location } = weather;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        blurRadius={80}
        source={require("../assets/images/bg.png")}
        style={styles.background}
      />
      {loading ? (
        null
      ) : (
        <SafeAreaView style={[styles.container, { marginVertical: 15 }]}>
          <View style={styles.searchPositioning}>
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : "transparent",
                },
              ]}
            >
              {showSearch ? (
                <TextInput
                  placeholder="Search City"
                  onChangeText={handleTextDebounce}
                  placeholderTextColor={"lightgray"}
                  style={styles.search}
                />
              ) : null}
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowSearch(!showSearch)}
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View style={styles.locations}>
                {locations.map((loc, index) => {
                  const showBorder = index + 1 != locations.length;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.location,
                        {
                          borderBottomColor: showBorder
                            ? "#BDBDBD"
                            : "transparent",
                        },
                      ]}
                      onPress={() => handleLocation(loc)}
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text style={styles.locationText}>
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          <View style={styles.weatherContainer}>
            <Text style={styles.city}>
              {location?.name}
              <Text style={styles.country}>{", " + location?.country}</Text>
            </Text>
            <View style={styles.weatherImageContainer}>
              <Image
                source={weatherImages[current?.condition?.text]}
                style={{ height: 200, width: 200 }}
              />
            </View>
            <View style={styles.forecastContainer}>
              <Text style={styles.temperature}>{current?.temp_c}&#176;</Text>
              <Text style={styles.weatherTitle}>
                {current?.condition?.text}
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.positioning}>
                <Image
                  source={require("../assets/icons/wind.png")}
                  style={{ height: 30, width: 30 }}
                />
                <Text style={styles.statText}>{current?.wind_kph}km</Text>
              </View>
              <View style={styles.positioning}>
                <Image
                  source={require("../assets/icons/drop.png")}
                  style={{ height: 30, width: 30 }}
                />
                <Text style={styles.statText}>{current?.humidity}%</Text>
              </View>
              <View style={styles.positioning}>
                <Image
                  source={require("../assets/icons/sun.png")}
                  style={{ height: 30, width: 30 }}
                />
                <Text style={styles.statText}>{weather?.forecast?.forecastday[0]?.astro.sunrise}</Text>
              </View>
            </View>
          </View>
          <View style={styles.upcomingWeatherContainer}>
            <View style={styles.upcomingWeather}>
              <CalendarDaysIcon size="22" color="white" />
              <Text style={styles.dailyForecast}>Daily Forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={styles.scrollView}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];
                return (
                  <View style={styles.dailyForecastContainer} key={index}>
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      style={{ height: 44, width: 44 }}
                    />
                    <Text style={{ color: "#FFFFFF" }}>{dayName}</Text>
                    <Text style={[styles.temperature, { fontSize: 24 }]}>
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  searchPositioning: {
    height: "7%",
    marginHorizontal: 15,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 50,
  },
  search: {
    paddingLeft: 20,
    height: 50,
    fontSize: 16,
    flex: 1,
    color: "#FFFFFF",
  },
  button: {
    borderRadius: 100,
    padding: 10,
    margin: 5,
    backgroundColor: theme.bgWhite(0.3),
  },
  locations: {
    width: "100%",
    backgroundColor: "rgb(209 213 219)",
    marginTop: 3,
    borderRadius: 24,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0,
    minHeight: 50,
    maxHeight: 150,
    paddingHorizontal: 24,
    marginBottom: 3,
    borderBottomWidth: 2,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 10,
  },
  city: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  country: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d1d5db",
  },
  weatherContainer: {
    marginHorizontal: 15,
    justifyContent: "space-around",
    flex: 1,
    marginBottom: 5,
    marginTop: 10,
  },
  weatherImageContainer: {
    alignItems: "center",
  },
  forecastContainer: {
    marginBottom: 10,
  },
  temperature: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#FFFFFF",
    fontSize: 60,
  },
  weatherTitle: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 18,
    letterSpacing: 1.2,
    marginRight: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: 5,
  },
  positioning: {
    flexDirection: "row",
    marginLeft: 8,
    alignItems: "center",
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 5,
  },
  upcomingWeatherContainer: {
    marginBottom: 5,
    marginVertical: 10,
  },
  upcomingWeather: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginLeft: 8,
  },
  dailyForecast: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 5,
  },
  scrollView: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  dailyForecastContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    paddingVertical: 10,
    marginLeft: 4,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: theme.bgWhite(0.15),
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
