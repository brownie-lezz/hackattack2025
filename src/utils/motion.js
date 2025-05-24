import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

const MotionBox = ({ children, variants }) => {
  const animation = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      animation.start("visible");
    }
    // else {
    //   animation.start("hidden");
    // }
  }, [animation, inView]);

  return (
    <motion.div
      className="box"
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={animation}
    >
      {children}
    </motion.div>
  );
};

export default MotionBox;