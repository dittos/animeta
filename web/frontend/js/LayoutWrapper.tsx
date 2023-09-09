import { RouteComponentProps } from './routes';
import React from 'react';
import { DataUpdater, Request, Response, RouteHandler, isNotFound, isRedirect } from 'nuri/app';
import { Loader } from '../../shared/loader';

type LayoutComponent<LayoutData> = React.JSXElementConstructor<{
  layoutData: LayoutData,
  children: React.ReactNode,
}>

export type LayoutHandler<LayoutData> = {
  component: LayoutComponent<LayoutData>;
  load: (request: Request<Loader>) => Promise<Response<LayoutData>>;
  renderTitle?: (data: LayoutData) => string;
}

export type Layout<LayoutData> = {
  wrap<InnerData>(inner: InnerHandler<LayoutData, InnerData>): RouteHandler<{
    layoutData: LayoutData,
    innerData: InnerData,
  }, Loader>
}

type InnerHandler<LayoutData, InnerData> = Omit<RouteHandler<InnerData, Loader>, 'renderTitle'> & {
  load: NonNullable<RouteHandler<InnerData, Loader>['load']>,
  extractLayoutData?: (data: InnerData) => LayoutData;
  renderTitle?: (data: InnerData, parentTitle: string) => string;
  unwrapLayoutOnStacked?: boolean;
}

export type RouteWithLayoutComponentProps<LayoutData, InnerData> = RouteComponentProps<InnerData> & {
  layoutData: LayoutData;
  writeLayoutData: (updater: DataUpdater<LayoutData>) => void;
}

type WrappedData<LayoutData, InnerData> = {
  layoutData: LayoutData,
  innerData: InnerData,
  stacked?: boolean,
}

function LayoutWrapper<LayoutData, InnerData>(
  LayoutComponent: LayoutComponent<LayoutData>,
  InnerComponent: React.JSXElementConstructor<RouteWithLayoutComponentProps<LayoutData, InnerData>>,
  unwrapLayoutOnStacked: boolean,
) {
  return (props: RouteComponentProps<WrappedData<LayoutData, InnerData>>) => {
    const inner = <InnerComponent
      {...props}
      data={props.data.innerData}
      writeData={updater => {
        props.writeData(data => {
          updater(data.innerData)
        })
      }}
      layoutData={props.data.layoutData}
      writeLayoutData={updater => {
        props.writeData(data => {
          updater(data.layoutData)
        })
      }}
    />
    if (props.data.stacked && unwrapLayoutOnStacked) {
      return inner
    }
    return (
      <LayoutComponent layoutData={props.data.layoutData}>
        {inner}
      </LayoutComponent>
    )
  };
}

function wrap<InnerData, LayoutData>(
  layout: LayoutHandler<LayoutData>,
  handler: InnerHandler<LayoutData, InnerData>,
): RouteHandler<WrappedData<LayoutData, InnerData>, Loader> {
  const {
    component,
    load,
    renderMeta,
    renderTitle,
    unwrapLayoutOnStacked = false,
    extractLayoutData,
    ...rest
  } = handler
  const layoutRenderTitle = layout.renderTitle
  return {
    component: component && LayoutWrapper(layout.component, component, unwrapLayoutOnStacked),

    load: async (request) => {
      const layoutDataPromise = extractLayoutData ? null : layout.load(request)
      const innerData = await load(request)
      if (isRedirect(innerData) || isNotFound(innerData)) {
        return innerData
      }
      const layoutData = extractLayoutData ? extractLayoutData(innerData) : await layoutDataPromise
      if (isRedirect(layoutData) || isNotFound(layoutData)) {
        return layoutData
      }
      return {
        layoutData,
        innerData,
        stacked: request.stacked,
      }
    },

    renderMeta: renderMeta && ((data) => renderMeta(data.innerData)),
    renderTitle: renderTitle ? (
      (data) => renderTitle(data.innerData, layoutRenderTitle ? layoutRenderTitle(data.layoutData) : '')
    ) : layoutRenderTitle && (
      (data) => layoutRenderTitle(data.layoutData)
    ),
    
    ...rest,
  }
}

export function createLayout<LayoutData>(handler: LayoutHandler<LayoutData>): Layout<LayoutData> {
  return {
    wrap(inner) {
      return wrap(handler, inner)
    }
  }
}
