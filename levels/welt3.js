export default {
  name: 'Sternennacht', night: true, sky: ['#27306e', '#6b63b8'], far: '#3e4f93', near: '#2f6b5a', grass: '#4fae6a', dirt: '#6e4a33', dirt2: '#573826', cloud: 'rgba(200,210,255,.35)', sun: '#fff6d6', sunX: 1060, sunY: 120, sunR: 44,
  build(b) {
    b.init(130); b.start(2);
    b.ground(0, 12); b.stars(5, 11, 3);
    b.plank(15, 11, 3); b.plank(20, 9, 3); b.plank(25, 11, 3);
    b.stars(15, 10, 3); b.stars(20, 8, 3); b.stars(25, 10, 3);
    b.ground(30, 42); b.snail(35); b.shroom(40); b.stars(39, 4, 3);
    b.block(43, 5, 5); b.stars(43, 4, 5);
    b.ground(46, 56); b.check(48); b.snail(53);
    b.ground(59, 61, 11); b.ground(64, 66, 9); b.stars(59, 10, 3); b.stars(64, 8, 3);
    b.ground(69, 82); b.check(70); b.snail(74); b.snail(79); b.stars(76, 11, 2);
    b.plank(85, 11, 3); b.plank(89, 9, 3); b.plank(93, 7, 3); b.stars(93, 6, 3);
    b.block(98, 7, 3);
    b.ground(103, 129); b.shroom(108); b.stars(107, 4, 3); b.snail(114); b.snail(120); b.stars(116, 11, 3);
    b.goal(126);
  }
};
