"use client";
import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { LangContext } from "@/contexts/LangContext";
import ImageSlider3D from "../imageSlider/ImageSlider3D";
import { FoodItem } from "@/types/types";
import { renderStars } from "../helpers/renderStars";
import { User } from "@supabase/supabase-js";

export default function FoodCard({ item }: { item: FoodItem }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [authSent, setAuthSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState(item.reviews);
  const { t, dir } = useContext(LangContext);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  // Check user on mount
  useState(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  });

  async function handleAuth() {
    if (!email) return;
    await supabase.auth.signInWithOtp({ email });
    setAuthSent(true);
  }

  async function handleSubmitReview() {
    setSubmitting(true);
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          food_item_id: item.id,
          rating: review.rating,
          comment: review.comment,
          user_email: user?.email,
        },
      ])
      .select("*");
    if (!error && data) {
      setReviews([...reviews, { ...review, user_email: user?.email }]);
      setIsDialogOpen(false);
      setReview({ rating: 5, comment: "" });
    }
    setSubmitting(false);
  }

  return (
    <Card className="w-full max-w-[320px] mx-auto my-4 shadow-lg" dir={dir}>
      <CardHeader>
        <div
          className="relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
          onClick={() => {
            setSliderIndex(0);
            setIsSliderOpen(true);
          }}
        >
          <img
            src={item.image_urls[0]}
            alt={item.name}
            className="w-full h-full object-cover"
            sizes="320px"
          />
        </div>
        <CardTitle className="mt-2">{item.name}</CardTitle>
        <div className="flex items-center justify-between mt-1">
          <span className="text-lg font-semibold">
            {t("price")}: ${item.price.toFixed(2)}
          </span>
          <span>
            {renderStars(averageRating)}{" "}
            <span className="ml-1 text-sm text-muted-foreground">
              {averageRating.toFixed(1)} / 5
              {"  "}
              ({Math.round((averageRating / 5) * 100)}%)
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            {t("add_review")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsReviewsDialogOpen(true)}
          >
            {t("view_reviews")}
          </Button>
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir={dir}>
          <DialogHeader>
            <DialogTitle>{t("add_review")}</DialogTitle>
          </DialogHeader>
          {!user ? (
            <div>
              <Input
                placeholder={t("your_email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authSent}
              />
              <Button
                className="mt-2"
                onClick={handleAuth}
                disabled={authSent || !email}
              >
                {authSent ? t("check_your_email") : t("send_magic_link")}
              </Button>
              <div className="text-xs text-muted-foreground mt-2">
                {t("verify_email_info")}
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitReview();
              }}
              className="space-y-2"
            >
              <Input
                type="number"
                min={1}
                max={5}
                value={review.rating}
                onChange={(e) =>
                  setReview({ ...review, rating: Number(e.target.value) })
                }
                placeholder={t("rating_placeholder")}
                required
              />
              <Textarea
                value={review.comment}
                onChange={(e) =>
                  setReview({ ...review, comment: e.target.value })
                }
                placeholder={t("your_review")}
                required
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? t("submitting") : t("submit_review")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isReviewsDialogOpen} onOpenChange={setIsReviewsDialogOpen}>
        <DialogContent dir={dir}>
          <DialogHeader>
            <DialogTitle>{t("reviews")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reviews.map((r, i) => (
              <div key={i} className="border-b pb-1">
                <div className="text-sm">{r.comment}</div>
                <div className="text-xs text-yellow-500">
                  {renderStars(r.rating)} {r.rating} / 5
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-sm text-muted-foreground">
                {t("no_reviews")}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ImageSlider3D
        open={isSliderOpen}
        onOpenChange={setIsSliderOpen}
        images={item.image_urls}
        initialIndex={sliderIndex}
        title={item.name}
        dir={dir as "ltr" | "rtl" | undefined}
      />
    </Card>
  );
}