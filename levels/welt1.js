export default {
  name: 'Sonnenwiese', sky: ['#6ec3ff', '#e2f5ff'], far: '#a6dd8c', near: '#6ec65c', grass: '#5cc24a', dirt: '#a4682f', dirt2: '#8a5424', cloud: 'rgba(255,255,255,.92)', sun: '#fff1a0', sunX: 1080, sunY: 120, sunR: 56,
  build(b) {
    b.init(100); b.start(2);
    b.ground(0, 22); b.ground(25, 45); b.ground(48, 70); b.ground(73, 99);
    b.stars(5, 11, 3);
    b.block(10, 10, 3); b.stars(10, 9, 3);
    b.snail(17);
    b.plank(21, 10, 5); b.stars(22, 9, 3);
    b.ground(30, 33, 11); b.stars(30, 10, 4);
    b.snail(40);
    b.check(51);
    b.block(55, 10, 2); b.block(59, 8, 3); b.stars(59, 7, 3);
    b.shroom(65); b.stars(64, 4, 3);
    b.stars(71, 11, 2);
    b.snail(80); b.stars(83, 11, 4); b.snail(90);
    b.goal(96);
  }
};
