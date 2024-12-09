/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2023 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 **************************************************************************/

import renderer from "react-test-renderer";
import Content from "./content";
import Header from "./header";

describe("Content", () => {
  it("should render correctly with valid Content and theme state", () => {
    let component = renderer.create(
      <div>
        <Header />
        <Content message={["Test"]} />
      </div>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
