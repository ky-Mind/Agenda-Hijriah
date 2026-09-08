import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Ikon Kisah Lillah: bulan sabit memeluk buku terbuka.
class KisahLillahIcon extends StatefulWidget {
  const KisahLillahIcon({super.key, this.size = 96, this.animated = true, this.onTap});
  final double size;
  final bool animated;
  final VoidCallback? onTap;

  @override
  State<KisahLillahIcon> createState() => _KisahLillahIconState();
}

class _KisahLillahIconState extends State<KisahLillahIcon> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);
  bool _pressed = false;

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final child = AnimatedBuilder(
      animation: _controller,
      builder: (_, __) => Transform.scale(
        scale: widget.animated ? 1 + (_controller.value * .025) : 1,
        child: CustomPaint(size: Size.square(widget.size), painter: _KisahLillahPainter(glow: widget.animated ? .72 + _controller.value * .28 : 1)),
      ),
    );
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(scale: _pressed ? .94 : 1, duration: const Duration(milliseconds: 120), child: child),
    );
  }
}

class _KisahLillahPainter extends CustomPainter {
  _KisahLillahPainter({required this.glow});
  final double glow;
  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 1024;
    canvas.scale(s);
    final bg = Paint()..shader = const LinearGradient(colors: [Color(0xFF0B6B63), Color(0xFF021F18)]).createShader(const Rect.fromLTWH(0, 0, 1024, 1024));
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(0, 0, 1024, 1024), const Radius.circular(205)), bg);
    final gold = Paint()..shader = const LinearGradient(colors: [Color(0xFFFFF0A7), Color(0xFFD6B25D), Color(0xFFA7792F)]).createShader(const Rect.fromLTWH(220, 160, 560, 640));
    canvas.drawArc(const Rect.fromLTWH(205, 150, 610, 650), math.pi * .25, math.pi * 1.5, false, gold..style = PaintingStyle.stroke..strokeWidth = 82..strokeCap = StrokeCap.round);
    final book = Paint()..color = Color.lerp(const Color(0xFFF8F1DC), Colors.white, glow * .15)!;
    final left = Path()..moveTo(278, 572)..quadraticBezierTo(400, 535, 512, 594)..lineTo(512, 832)..quadraticBezierTo(395, 770, 278, 810)..close();
    final right = Path()..moveTo(746, 572)..quadraticBezierTo(624, 535, 512, 594)..lineTo(512, 832)..quadraticBezierTo(629, 770, 746, 810)..close();
    canvas.drawPath(left, book); canvas.drawPath(right, book..color = const Color(0xFFEFE4BF));
    final sparkle = Paint()..color = Color(0xFFFFF0A7).withOpacity(glow);
    canvas.drawCircle(const Offset(705, 337), 16, sparkle); canvas.drawRect(const Rect.fromLTWH(696, 295, 18, 84), sparkle); canvas.drawRect(const Rect.fromLTWH(663, 328, 84, 18), sparkle);
  }
  @override
  bool shouldRepaint(covariant _KisahLillahPainter oldDelegate) => oldDelegate.glow != glow;
}
