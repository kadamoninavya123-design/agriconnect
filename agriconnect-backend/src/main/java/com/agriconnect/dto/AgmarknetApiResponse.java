package com.agriconnect.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AgmarknetApiResponse {

    private List<AgmarknetRecord> records;

    public List<AgmarknetRecord> getRecords() {
        return records;
    }

    public void setRecords(List<AgmarknetRecord> records) {
        this.records = records;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AgmarknetRecord {

        private String state;
        private String market;
        private String commodity;
        private String variety;
        private String arrival_date;
        private String min_price;
        private String max_price;
        private String modal_price;

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getMarket() {
            return market;
        }

        public void setMarket(String market) {
            this.market = market;
        }

        public String getCommodity() {
            return commodity;
        }

        public void setCommodity(String commodity) {
            this.commodity = commodity;
        }

        public String getVariety() {
            return variety;
        }

        public void setVariety(String variety) {
            this.variety = variety;
        }

        public String getArrival_date() {
            return arrival_date;
        }

        public void setArrival_date(String arrival_date) {
            this.arrival_date = arrival_date;
        }

        public String getMin_price() {
            return min_price;
        }

        public void setMin_price(String min_price) {
            this.min_price = min_price;
        }

        public String getMax_price() {
            return max_price;
        }

        public void setMax_price(String max_price) {
            this.max_price = max_price;
        }

        public String getModal_price() {
            return modal_price;
        }

        public void setModal_price(String modal_price) {
            this.modal_price = modal_price;
        }
    }
}