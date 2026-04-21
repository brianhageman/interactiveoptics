# Ray Quest

An optics puzzle game for reflection and refraction practice.

Open `index.html` in a browser. Aim the source, rotate mirrors or glass boundaries, sketch the ray path on paper, then set the receiver's y-coordinate on the fixed receiver line where the beam should land. Fire the beam to reveal the traced path. Angles use the standard convention: `0°` along +x with positive rotation counterclockwise. The simulation applies:

- Reflection: `theta_i = theta_r`
- Refraction: `n1 sin(theta1) = n2 sin(theta2)`

The HUD rewards accurate paths across five levels of increasing difficulty, from a single mirror to multi-step reflection/refraction ray traces.

Each level tracks attempts. A first-try hit earns full points; each additional attempt applies a linear percentage penalty, with a minimum payout so students can keep experimenting.
