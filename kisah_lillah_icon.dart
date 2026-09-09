import 'package:flutter/material.dart';

/// Shared Kisah Lillah branding icon.
class KisahLillahIcon extends StatefulWidget {
  const KisahLillahIcon({
    Key? key,
    this.size = 96,
    this.animated = true,
    this.onTap,
  }) : super(key: key);
  final double size;
  final bool animated;
  final VoidCallback? onTap;

  @override
  State<KisahLillahIcon> createState() => _KisahLillahIconState();
}

class _KisahLillahIconState extends State<KisahLillahIcon>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 3),
  )..repeat(reverse: true);
  bool _pressed = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final child = AnimatedBuilder(
      animation: _controller,
      builder: (_, __) => Transform.scale(
        scale: widget.animated ? 1 + (_controller.value * .025) : 1,
        child: Image.asset(
          'assets/kisah-lillah-logo.png',
          width: widget.size,
          height: widget.size,
          fit: BoxFit.contain,
          semanticLabel: 'Kisah Lillah',
        ),
      ),
    );
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? .94 : 1,
        duration: const Duration(milliseconds: 120),
        child: child,
      ),
    );
  }
}
