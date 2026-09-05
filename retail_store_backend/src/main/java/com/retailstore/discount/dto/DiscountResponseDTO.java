package com.retailstore.discount.dto;

public class DiscountResponseDTO {

    private double finalAmount;         // Final payable amount
    private double discountAmount;      // Total discount applied (best offer)
    private double bulkDiscount;        // Mandatory shop-wise 15% discount
    private double festivalDiscount;    // Festival offer (best among shops)
    private double highValueDiscount;   // High value 10% discount
    private double bestOffer;           // Best among festival / high value

    //  REQUIRED by Jackson — THIS WAS MISSING
    public DiscountResponseDTO() {
    }

    // ------------------ GETTERS & SETTERS ----------------------

    public double getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(double finalAmount) {
        this.finalAmount = finalAmount;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public double getBulkDiscount() {
        return bulkDiscount;
    }

    public void setBulkDiscount(double bulkDiscount) {
        this.bulkDiscount = bulkDiscount;
    }

    public double getFestivalDiscount() {
        return festivalDiscount;
    }

    public void setFestivalDiscount(double festivalDiscount) {
        this.festivalDiscount = festivalDiscount;
    }

    public double getHighValueDiscount() {
        return highValueDiscount;
    }

    public void setHighValueDiscount(double highValueDiscount) {
        this.highValueDiscount = highValueDiscount;
    }

    public double getBestOffer() {
        return bestOffer;
    }

    public void setBestOffer(double bestOffer) {
        this.bestOffer = bestOffer;
    }
}
