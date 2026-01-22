export class AnimationController {
  tween?: gsap.core.Tween;

  public setTween(value?: gsap.core.Tween) {
    this.tween = value;
    if (this.tween) {
      this.tween.pause();
    }
  }

  public async play() {
    if (this.tween) {
      await this.tween.play();
    }
  }
}
