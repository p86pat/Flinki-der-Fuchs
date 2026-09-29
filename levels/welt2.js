export default {
  name: 'Abendhügel', sky: ['#ff9a7a', '#ffe2b0'], far: '#e8b27a', near: '#8cc56a', grass: '#78c24e', dirt: '#9a5f34', dirt2: '#7e4a25', cloud: 'rgba(255,240,230,.9)', sun: '#ffcf5a', sunX: 980, sunY: 330, sunR: 90,
  build(b) {
    b.init(120); b.start(2);
    b.ground(0, 15); b.stars(4, 11, 3); b.snail(11);
    b.plank(16, 9, 3); b.stars(16, 8, 3);
    b.ground(19, 32); b.ground(24, 27, 11); b.stars(19, 11, 2); b.stars(24, 10, 4); b.snail(30);
    b.ground(36, 42); b.shroom(39); b.stars(38, 4, 3);
    b.block(42, 5, 6); b.stars(43, 4, 4);
    b.ground(46, 58); b.check(50); b.snail(55);
    b.ground(62, 64, 10); b.stars(62, 9, 3);
    b.ground(68, 82); b.check(69); b.stars(71, 11, 2); b.snail(75); b.snail(80);
    b.plank(84, 10, 3); b.plank(89, 8, 3); b.stars(89, 7, 3);
    b.ground(94, 119); b.shroom(100); b.stars(99, 4, 3); b.snail(106); b.stars(108, 11, 4);
    b.goal(115);
  }
};
